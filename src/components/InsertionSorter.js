import React, { useState, useContext, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { motion } from 'framer-motion'

import DataContext from '../contexts/DataContext'
import ControlWidget from './ControlWidget'
import AlgoInfo from './AlgoInfo'
import SortNode from './SortNode'
import { SortContainer } from '../styles'

const InsertionSorter = () => {
  const { data, metrics, setMetrics, isRunning, setIsRunning } = useContext(DataContext)
  const [ sortedData, setSortedData ] = useState([])
  const refContainer = useRef(isRunning)
  const history = useHistory()

  const insertion = {...metrics.insertion}

  useEffect(() => setSortedData(data), [data])
  useEffect(() => {
    refContainer.current = isRunning
  }, [isRunning])

  useEffect(() => {
    return history.listen(() => {
      if (isRunning) setMetrics({ ...metrics, insertion: { access: 0, swaps: 0 } })
      refContainer.current = false
      setIsRunning(false)
    })
  }, [history, setIsRunning, isRunning, metrics, setMetrics])

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const insertionSort = async () => {
    setIsRunning(true)
    await sleep(5)
    const copy = data.slice()
    insertion.access = 0
    insertion.swaps = 0
    const bars = document.getElementsByClassName('bar')

    for (let i = 1; i < copy.length; i++) {
      if (!refContainer.current) return
      insertion.access++
      let key = copy[i]
      let j = i - 1
      while (j >= 0 && copy[j] > key) {
        if (!refContainer.current) return
        insertion.access++
        insertion.swaps++

        bars[j + 1].style.backgroundColor = '#DC3545'
        bars[j].style.backgroundColor = '#DC3545'
        copy[j + 1] = copy[j]
        await sleep(5)
        bars[j + 1].style.backgroundColor = '#02203c'
        bars[j].style.backgroundColor = '#02203c'
        j = j - 1

        if (!refContainer.current) return
        setMetrics({ ...metrics, insertion })
        setSortedData([...copy])
      }
      insertion.access++
      copy[j + 1] = key
      setSortedData([...copy])
    }
    refContainer.current = false
    setIsRunning(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}><ControlWidget algo={insertionSort} /></motion.div>
      <SortContainer initial={{ x: '40vw' }} animate={{ x: 0 }} transition={{ duration: .25, type: 'spring', stiffness: 40, }}>
        {sortedData.map((value, index) => <SortNode key={index} value={value} />)}
      </SortContainer>
      <AlgoInfo info={info} />
    </motion.div>
  )
}

export default InsertionSorter


const info = {
  timeBigO: '$\\mathcal O(n^2)$',
  spaceBigO: '$\\mathcal O(1)$',
  time: 'n is the length of the input array. The outer loop i contributes O(n) in isolation, this is plain to see. The inner loop j is more complicated. We know j will iterate until it finds an appropriate place to insert the currElement into the sorted region. The two loops are nested so our total time complexity is O(n * n / 2) = O(n2).',
  space: 'The amount of memory consumed by the algorithm does not increase relative to the size of the input array. We use the same amount of memory and create the same amount of variables regardless of the size of our input. A quick indicator of this is the fact that we don\'t create any arrays.',
}
