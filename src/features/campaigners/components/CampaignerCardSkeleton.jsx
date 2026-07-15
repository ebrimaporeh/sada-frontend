const SKELETON_RATIOS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[3/4]']

export function CampaignerCardSkeleton({ index = 0 }) {
  return (
    <div className={`w-full ${SKELETON_RATIOS[index % SKELETON_RATIOS.length]} bg-muted rounded-2xl animate-pulse mb-4 break-inside-avoid`} />
  )
}
