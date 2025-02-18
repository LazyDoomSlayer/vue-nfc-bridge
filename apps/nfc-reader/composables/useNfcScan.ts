import { ref, onUnmounted, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { INFCRecordObject, TNDEFRecordMessageHeader } from '../types'
import { decodeNDEFData } from '../utils/nfc.helper'

interface IUseNfcScanResponse {
  isScanning: Ref<boolean>
  nfcRecords: Ref<INFCRecordObject[]>
  appId: ComputedRef<string | null>
  devEUI: ComputedRef<string | null>

  startNfcScan: () => Promise<void>
  stopNfcScan: () => void
}

export default function useNfcScan(): IUseNfcScanResponse {
  const isScanning = ref<boolean>(false)
  const nfcRecords = ref<INFCRecordObject[]>([])

  const appId = computed((): string | null => parseMessageFromNDEFRecord('AppId'))
  const devEUI = computed((): string | null => parseMessageFromNDEFRecord('DevEUI'))

  let nfcReader: unknown | null = null

  function parseMessageFromNDEFRecord(type: TNDEFRecordMessageHeader): string | null {
    const item = nfcRecords.value.find((el) => el.data.startsWith(`${type}=`))
    return item ? item.data.split('=')[1] : null
  }

  const startNfcScan = async () => {
    if (!('NDEFReader' in window)) {
      alert('Web NFC is not supported in this browser.')
      return
    }

    try {
      nfcReader = new window.NDEFReader()
      isScanning.value = true // Mark scanner as ready
      console.log('✅ NFC scanning started. Tap an NFC device.')

      await nfcReader.scan()

      nfcReader.addEventListener('reading', (event) => {
        nfcRecords.value = event.message.records.map((record) => ({
          id: record.id,
          recordType: record.recordType,
          mediaType: record.mediaType || 'N/A',
          encoding: record.encoding || 'N/A',
          lang: record.lang || 'N/A',
          data: decodeNDEFData(record.data),
        }))
      })

      nfcReader.addEventListener('readingerror', () => {
        console.error('❌ NFC Read Error: Unable to read data')
        isScanning.value = false
      })
    } catch (error) {
      console.error('❌ NFC scanning error:', error)
      isScanning.value = false
    }
  }

  const stopNfcScan = () => {
    if (nfcReader) {
      isScanning.value = false
    }
  }

  onUnmounted(() => {
    stopNfcScan()
  })

  return {
    isScanning,
    nfcRecords,
    appId,
    devEUI,
    startNfcScan,
    stopNfcScan,
  }
}
