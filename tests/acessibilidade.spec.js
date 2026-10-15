import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { bloquearMapa } from './mapa-falso.js';

test('sem violações de acessibilidade (axe, WCAG A/AA)', async ({ page }) => {
  await bloquearMapa(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // conteúdo já visível, sem animações
  await page.goto('/');
  const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const resumo = resultado.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(resumo).toEqual([]);
});
