import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import { CreateTransactionValidator, UpdateTransactionValidator } from '#validators/transaction'
import { DateTime } from 'luxon'

export default class TransactionsController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')
    const subscriptionId = request.input('subscriptionId')
    const startDate = request.input('startDate')
    const endDate = request.input('endDate')

    const query = Transaction.query()
      .preload('subscription', (subscriptionQuery) => {
        subscriptionQuery.preload('client').preload('plan')
      })

    if (status) {
      query.where('status', status)
    }
    if (subscriptionId) {
      query.where('subscriptionId', subscriptionId)
    }
    if (startDate && endDate) {
      query.whereBetween('date', [startDate, endDate])
    }

    const transactions = await query.paginate(page, limit)
    return response.json(transactions)
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('subscription', (subscriptionQuery) => {
        subscriptionQuery.preload('client').preload('plan')
      })
      .firstOrFail()

    return response.json(transaction)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateTransactionValidator)
    const transaction = await Transaction.create({
      ...payload,
      date: payload.date || DateTime.now(),
      status: payload.status || 'PENDING'
    })
    
    await transaction.load('subscription')
    return response.created(transaction)
  }

  async update({ params, request, response }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    const payload = await request.validate(UpdateTransactionValidator)
    
    await transaction.merge(payload).save()
    await transaction.load('subscription')
    
    return response.json(transaction)
  }

  async processRefund({ params, request, response }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    const reason = request.input('reason')
    
    if (transaction.status !== 'COMPLETED') {
      return response.badRequest({
        message: 'Seules les transactions complétées peuvent être remboursées'
      })
    }

    if (transaction.status === 'REFUNDED') {
      return response.badRequest({
        message: 'Cette transaction a déjà été remboursée'
      })
    }

    transaction.status = 'REFUNDED'
    transaction.refundedAt = DateTime.now()
    transaction.metadata = {
      ...transaction.metadata,
      refundReason: reason,
      refundDate: DateTime.now().toISO()
    }
    
    await transaction.save()
    return response.json(transaction)
  }

  async getStats({ request, response }: HttpContext) {
    const startDate = request.input('startDate', DateTime.now().minus({ months: 1 }).toISODate())
    const endDate = request.input('endDate', DateTime.now().toISODate())
    
    const transactions = await Transaction.query()
      .whereBetween('date', [startDate, endDate])

    const stats = {
      totalAmount: transactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
      countByStatus: transactions.reduce((acc, tx) => {
        acc[tx.status] = (acc[tx.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      amountByStatus: transactions.reduce((acc, tx) => {
        acc[tx.status] = (acc[tx.status] || 0) + Number(tx.amount)
        return acc
      }, {} as Record<string, number>)
    }

    return response.json(stats)
  }

  async generateInvoice({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('subscription', (query) => {
        query.preload('client').preload('plan')
      })
      .firstOrFail()

    // Logique de génération de facture à implémenter
    const invoice = {
      invoiceNumber: transaction.invoiceNumber,
      date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      client: transaction.subscription.client,
      plan: transaction.subscription.plan,
      // Autres détails de la facture
    }

    return response.json(invoice)
  }
}