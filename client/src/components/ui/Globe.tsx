'use client'
import React, {useState} from 'react'
import Earth from './Earth1'

type Props = {}

const Globe = (props: Props) => {
    const [hovered, setHovered] = useState<boolean>(false)
    const [hovered1, setHovered1] = useState<boolean>(false)
  return (
    <div className='overflow-hidden relative'>
    <div className='max-w-[1280px] mx-auto relative z-[2]'>
  
    </div>
    <div className={`relative z-[2] max-sm:hidden`}>
      <Earth/>
    </div>
  </div>
  )
}

export default Globe