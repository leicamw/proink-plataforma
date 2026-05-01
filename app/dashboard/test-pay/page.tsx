import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Preference } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago'

export default async function TestPayPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  async function startTestCheckout() {
    'use server'
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const preference = new Preference(mpClient)
    const response = await preference.create({
      body: {
        items: [{
          id: 'test',
          title: 'Pro Ink Academy — Teste de Pagamento',
          description: '10 créditos de teste',
          quantity: 1,
          unit_price: 1.00,
          currency_id: 'BRL',
        }],
        external_reference: `${userId}|starter|test`,
        back_urls: {
          success: `${appUrl}/dashboard?success=true`,
          failure: `${appUrl}/dashboard?canceled=true`,
          pending: `${appUrl}/dashboard?pending=true`,
        },
        auto_return: 'approved',
        statement_descriptor: 'PRO INK TESTE',
      },
    })
    redirect(response.init_point!)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="bg-[#111] border border-white/10 p-8 max-w-sm w-full text-center">
        <h1 className="text-white font-bold text-xl mb-2">Pagamento de Teste</h1>
        <p className="text-white/50 text-sm mb-6">R$ 1,00 → 10 créditos na sua conta</p>
        <form action={startTestCheckout}>
          <button
            type="submit"
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 px-6 transition-colors"
          >
            Pagar R$ 1,00 via Mercado Pago
          </button>
        </form>
      </div>
    </div>
  )
}
