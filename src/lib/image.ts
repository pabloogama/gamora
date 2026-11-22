/** Recorta a imagem em quadrado (centro) e reduz para `size` px. Retorna data URL (webp, ou jpeg se o navegador não suportar). */
export async function squareImage(file: File, size = 256): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Não foi possível ler esta imagem.'))
      i.src = url
    })
    const s = Math.min(img.naturalWidth, img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Não foi possível processar a imagem.')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size)
    const webp = canvas.toDataURL('image/webp', 0.85)
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? ''
