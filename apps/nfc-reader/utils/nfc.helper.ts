export function decodeNDEFData(data: AllowSharedBufferSource | string): string {
  if (typeof data === 'string') return data

  try {
    return new TextDecoder().decode(data)
  } catch (error) {
    console.error(error)
  }

  return 'Unknown Data'
}
