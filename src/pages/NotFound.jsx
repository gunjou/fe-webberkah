import React from 'react'


const NotFound = () => {
  return (
    <div className="Not Found">
      <img
        src={process.env.PUBLIC_URL + "images/2-error-404.png"}
        alt="404"
        className="m-auto mt-20"
      />
      <p className="text-gray-700">Please check your URL</p>
      <a href="/" className='text-blue-600 hover:text-blue-800 hover:underline'>Back to Home</a>
    </div>
  )
}

export default NotFound