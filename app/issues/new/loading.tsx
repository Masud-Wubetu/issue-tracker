import { Box, Skeleton } from '@radix-ui/themes'
import React from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'

const LoadingNewIssuePage = () => {
  return (
    <Box>
      <Skeleton/>
      <Skeleton height="20rem"/>
    </Box>
  )
}

export default LoadingNewIssuePage