'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'

export default function AdminThemeInlineMount() {
  const [mountNodes, setMountNodes] = useState<HTMLElement[]>([])

  useEffect(() => {
    const syncMountNodes = () => {
      const headers = document.querySelectorAll<HTMLElement>('header')
      headers.forEach((header) => {
        if (header.closest('[data-admin-theme-inline]')) {
          return
        }
        header.classList.add('sticky', 'top-0', 'z-30', 'shrink-0')
      })

      const containers = document.querySelectorAll<HTMLElement>(
        'header .flex.items-center.gap-6, header .flex.items-center.gap-4'
      )

      containers.forEach((container) => {
        if (container.querySelector('[data-admin-theme-inline]')) {
          return
        }

        const mountNode = document.createElement('div')
        mountNode.setAttribute('data-admin-theme-inline', 'true')
        mountNode.className = 'relative flex items-center'

        const divider = Array.from(container.children).find((child) => {
          if (!(child instanceof HTMLElement)) {
            return false
          }

          const hasHeight = child.classList.contains('h-8')
          const hasWidth = child.classList.contains('w-px') || child.classList.contains('w-[1px]')
          return hasHeight && hasWidth
        })

        if (divider) {
          container.insertBefore(mountNode, divider)
        } else {
          container.appendChild(mountNode)
        }
      })

      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>('[data-admin-theme-inline]')
      ).filter((node) => node.isConnected)

      setMountNodes(nodes)
    }

    syncMountNodes()
    const observer = new MutationObserver(syncMountNodes)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {mountNodes.map((node, index) => createPortal(<ThemeSwitcher />, node, `admin-theme-inline-${index}`))}
    </>
  )
}
