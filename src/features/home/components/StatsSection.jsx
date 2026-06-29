const stats = [
  { label: 'Total Raised', value: 'D 12.5M' },
  { label: 'Active Campaigns', value: '247' },
  { label: 'Generous Donors', value: '8,945' },
  { label: 'Success Rate', value: '78%' },
]

export function StatsSection() {
  return (
    <section className="border-y py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{value}</p>
              <p className="text-sm md:text-base text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
