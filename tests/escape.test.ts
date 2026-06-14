import { describe, it, expect } from 'vitest'
import { escapeHtml } from '../src/renderer/escape'

describe('escapeHtml', () => {
  it('escapes all HTML-significant characters', () => {
    expect(escapeHtml(`<script>alert("x" & 'y')</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;'
    )
  })

  it('leaves plain text untouched', () => {
    expect(escapeHtml('my-repo_42')).toBe('my-repo_42')
  })

  it('escapes a folder name with ampersands and angle brackets', () => {
    expect(escapeHtml('foo & <bar>')).toBe('foo &amp; &lt;bar&gt;')
  })
})
