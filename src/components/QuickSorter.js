import React, { useState, useContext, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { motion } from 'framer-motion'

import DataContext from '../contexts/DataContext'
import ControlWidget from './ControlWidget'
import AlgoInfo from './AlgoInfo'
import SortNode from './SortNode'
import { SortContainer } from '../styles'

const QuickSorter = () => {
  const { data, metrics, setMetrics, isRunning, setIsRunning } = useContext(DataContext)
  const [ sortedData, setSortedData ] = useState([])
  const refContainer = useRef(isRunning)
  const history = useHistory()

  const quick = {...metrics.quick}
  const bars = document.getElementsByClassName('bar')

  useEffect(() => setSortedData(data), [data])
  useEffect(() => {
    refContainer.current = isRunning
  }, [isRunning])

  useEffect(() => {
    return history.listen(() => {
      if (isRunning) {
        setMetrics({ ...metrics, quick: { access: 0, swaps: 0 } })
      }
      refContainer.current = false
      setIsRunning(false)
    })
  }, [history, setIsRunning, isRunning, metrics, setMetrics])

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const quickSortHelper = async () => {
    setIsRunning(true)
    await sleep(5)
    const copy = data.slice()
    quick.access = 0
    quick.swaps = 0
    await quickSort(copy, 0, copy.length - 1)
    refContainer.current = false
    setIsRunning(false)
  }

  const quickSort = async (array, start, end) => {
    if (start >= end) return
    if (!refContainer.current) return
    let index = await partition(array, start, end)
    await quickSort(array, start, index - 1)
    await quickSort(array, index + 1, end)
    // Promise.all([quickSort(array, start, index - 1), quickSort(array, index + 1, end)])
  }

  const partition = async (array, start, end) => {
    if (!refContainer.current) return
    let pivotValue = array[end]
    quick.access++
    setMetrics({ ...metrics, quick })
    let pivotIndex = start
    for (let i = start; i < end; i++) {
      if (!refContainer.current) return
      quick.access++
      if (array[i] < pivotValue) {
        const swapped = await swap(i, pivotIndex, array)
        quick.swaps++
        setSortedData([...swapped])
        pivotIndex++
      }
    }

    const swapped = await swap(pivotIndex, end, array)
    quick.swaps++
    if (!refContainer.current) return
    setMetrics({ ...metrics, quick })
    setSortedData([...swapped])
    return pivotIndex
  }

  const swap = async (firstIndx, secondIndx, array) => {
    bars[firstIndx].style.backgroundColor = '#DC3545'
    bars[secondIndx].style.backgroundColor = '#DC3545'
    let temp = array[firstIndx]
    array[firstIndx] = array[secondIndx]
    array[secondIndx] = temp
    await sleep(15)
    bars[firstIndx].style.backgroundColor = '#02203c'
    bars[secondIndx].style.backgroundColor = '#02203c'
    return array
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}><ControlWidget algo={quickSortHelper} /></motion.div>
      <SortContainer initial={{ x: '40vw' }} animate={{ x: 0 }} transition={{ duration: .25, type: 'spring', stiffness: 40, }}>
        {sortedData.map((value, index) => <SortNode key={index} value={value} />)}
      </SortContainer>
      <AlgoInfo info={info} />
    </motion.div>
  )
}

export default QuickSorter


const info = {
  timeBigO: '$Avg: \\mathcal{O}(n\\cdot\\log{}n) \\hspace{1cm} Worst: \\mathcal O(n^2)$',
  spaceBigO: '$\\mathcal O(\\log{}n)$',
  time: 'n is the length of the input array. The partition step alone is O(n). The partition step occurs in every recursive call, so our total complexities are: Best Case: O(n * log(n)) Worst Case: O(n2)',
  space: 'Our implementation of quickSort uses O(n) space because of the partition arrays we create. There is an in-place version of quickSort that uses O(log(n)) space. O(log(n)) space is not huge benefit over O(n). You\'ll also find our version of quickSort as easier to remember, easier to implement. Just know that a O(logn) space quickSort exists.',
}


  // const quickSort = async (array) => {

  //   // setSortedData([sortedData, ...array])
  //   if (array.length <= 1) return array

  //   let pivot = array.shift()
  //   bars[sortedData.indexOf(pivot)].style.backgroundColor = '#DC3545'

  //   let left = array.filter(el => el < pivot)
  //   let right = array.filter(el => el >= pivot)

  //   await sleep(100)

  //   let leftSorted = await quickSort(left)
  //   let rightSorted = await quickSort(right)

  //   bars[sortedData.indexOf(pivot)].style.backgroundColor = '#02203c'

  //   // let [leftSorted, rightSorted ] = await Promise.all([quickSort(left), quickSort(right)])

  //   // setSortedData([...array])
  //   setSortedData([ ...leftSorted, pivot, ...rightSorted ])
  //   return [ ...leftSorted, pivot, ...rightSorted ]

  // }
