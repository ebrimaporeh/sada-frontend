const providers = [
  { name: 'ModemPay', color: 'bg-blue-600', short: 'MP' },
  { name: 'Wave', color: 'bg-cyan-500', short: 'W' },
  { name: 'Orange Money', color: 'bg-orange-500', short: 'OM' },
  { name: 'Afrimoney', color: 'bg-green-600', short: 'AF' },
]

export function MobileMoneySection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 sm:p-12 text-primary-foreground overflow-hidden relative">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary-foreground/70 uppercase tracking-wider">
              No bank account needed
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Pay with your phone in seconds
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              GambiaFund uses ModemPay to accept donations from all major Gambian mobile money providers. Donate from anywhere — inside The Gambia or from the diaspora.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {providers.map(({ name, color, short }) => (
                <div key={name} className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-3 py-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${color}`}>
                    {short}
                  </div>
                  <span className="text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-primary-foreground/70">Payment flow</p>
            {[
              'Donor selects amount',
              'Chooses mobile money provider',
              'Receives prompt on phone',
              'Confirms with PIN',
              'Donation confirmed ✓',
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
