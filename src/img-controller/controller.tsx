import { HistogramWidget } from '@/grad'
import { IPicture } from '@/lib'
import { MonochromicWidget } from '@/monochromic/ui/widget'
import React from 'react'

const enum Tabs {
  HISTOGRAM,
  MONOCHROME,
}

const tabSwitcher = (tab: Tabs, srcPicture: IPicture) => {
  switch (tab) {
    case Tabs.HISTOGRAM:
      return <HistogramWidget srcPicture={srcPicture} />
    case Tabs.MONOCHROME:
      return <MonochromicWidget srcPicture={srcPicture}/>
    default:
      return <></>
  }
}

const TabElement = ({ title, isActive, ...rest}: { title: string, isActive: boolean } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      {...rest} 
      style={{
        fontWeight: isActive ? 700 : 100, 
        textDecoration: isActive ? 'underline overline' : 'underline', 
        textUnderlineOffset: 6
      }} 
      className='px-2 py-4 cursor-pointer max-w-fit'
    >
      { title }
    </div>
  )
}

const TabPicker = ({ 
  currentTab, 
  setter 
}: { currentTab: Tabs, setter: (newTab: Tabs) => void }) => {
  return (
    <div className='pb-2 flex flex-row'>
      <TabElement title='Histogram' isActive={currentTab === Tabs.HISTOGRAM} onClick={() => setter(Tabs.HISTOGRAM)} />
      <TabElement title='Monochrome' isActive={currentTab === Tabs.MONOCHROME} onClick={() => setter(Tabs.MONOCHROME)} />
    </div>
  )
}

export const ImageController = ({ srcPicture }: {srcPicture: IPicture}) => {
  const [tab, setTab] = React.useState<Tabs>(Tabs.HISTOGRAM)

  return (
    <div className='flex flex-col gap-1 bg-zinc-900 absolute text-gray-50 px-2 py-1 top-1 right-full mr-1 shadow-md shadow-slate-600 rounded w-screen max-w-xl'>
      <TabPicker currentTab={tab} setter={setTab} />
      { tabSwitcher(tab, srcPicture) }
    </div>
  )
}
