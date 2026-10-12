# Fontes do hermes-design-system.html

O arquivo final na raiz é a concatenação destas partes, nesta ordem:

    cat head.html part1.css part2.css part3.css part4.css > tmp
    printf '</style>\n</head>\n' >> tmp
    cat html-a.html html-b.html html-c.html html-d.html js-a.js js-b.js >> tmp
    mv tmp ../../hermes-design-system.html

- part1.css  tokens (claro/escuro), reset, layout, tipo
- part2.css  marca, cards, vidro, topbar, botões, selos, chips de ferramenta, inputs, swatches, tabela, abas
- part3.css  hero (faísca + título), feedback (toasts, faixas, skeleton), progresso (barras, anéis, trilha, medidor)
- part4.css  agente (quadro, cartão, linha do tempo, registro, aprovação, conversa), shell, rodapé, modal, reduced-motion
- html-a..d  topbar, hero, intro, fundamentos | hero-doc, superfícies, ícones, componentes | agente, feedback, progresso | shell, rodapés, notas
- js-a.js    interações (tema, idioma, toasts, progresso do zero, skeleton, registro ao vivo)
- js-b.js    port do gemini-io2026-spark2 em three.js (import map + módulo)
