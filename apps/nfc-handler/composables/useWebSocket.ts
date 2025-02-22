import { io, Socket } from 'socket.io-client'

import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { ENFCScanStatus, EWebsocketClient } from '../types'
import type { INfcResponseDTO, INfcScanDTO } from '../types'

interface IUseWebSocket {
  socket: Ref<Socket | null>
  incomingMessage: Ref<unknown[]>
  appId: Ref<string | null>
  devEUI: Ref<string | null>
  connectSocket: () => void
  sendNfcResponseMessage: (status: ENFCScanStatus) => void
  disconnectSocket: () => void
}

export function useWebSocket(
  accessToken: Ref<string>,
  clientType: EWebsocketClient,
): IUseWebSocket {
  const socket = ref<Socket | null>(null)
  const incomingMessage = ref<unknown[]>([])
  const appId = ref<string | null>(null)
  const devEUI = ref<string | null>(null)

  const connectSocket = () => {
    if (!accessToken.value) throw new Error('Could not get token')
    if (socket.value) throw new Error('Already connected. Try disconnecting first.')

    socket.value = io(import.meta.env.VITE_NEST_ENDPOINT, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      secure: true,
      withCredentials: true,
      rejectUnauthorized: false,
      auth: {
        token: accessToken.value,
        client: clientType,
      },
    })

    socket.value.on('connect', () => {
      console.log('✅ Connected to WebSocket Server')
    })

    socket.value.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket Server')
    })

    socket.value.on('nfc-scan', (data) => {
      console.log('📡 Received NFC scan data:', data)
      incomingMessage.value = data as unknown[]

      const nfcScanObject = data as INfcScanDTO
      appId.value = nfcScanObject.applicationExtendedUniqueIdentifier ?? null
      devEUI.value = nfcScanObject.deviceExtendedUniqueIdentifier ?? null
    })
  }

  const sendNfcResponseMessage = (status: ENFCScanStatus) => {
    try {
      const nfcResponseObject: INfcResponseDTO = { status }

      if (status === ENFCScanStatus.SUCCESS) {
        nfcResponseObject.message = '✅ All good, you can clear and scan another'
      }

      socket.value?.emit('nfc-response', nfcResponseObject)
    } catch (error) {
      console.error('❌ Error sending NFC response:', error)
    }
  }

  const disconnectSocket = () => {
    socket.value?.disconnect()
    socket.value = null
  }

  onUnmounted(() => {
    disconnectSocket()
  })

  return {
    // @ts-expect-error Readonly remove
    socket,
    incomingMessage,
    appId,
    devEUI,
    connectSocket,
    sendNfcResponseMessage,
    disconnectSocket,
  }
}
