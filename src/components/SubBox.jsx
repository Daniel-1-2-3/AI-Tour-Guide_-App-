import PropTypes from 'prop-types'
import { useState } from 'react'

const SubBox = ({subtitle, text}) => {
  return (
    <div className='w-full text-center justify-center bg-white mt-6 rounded-2xl'>
       <p className='pt-5 text-red-700'>{subtitle}</p>
       <p className='p-2'>{text}</p>
    </div>
  )
}
SubBox.propTypes = {
    subtitle: PropTypes.string,
    text: PropTypes.string,
}

export default SubBox