# AlertaBairro

**Objetivo:** protótipo de site (Tecnologia Cidadã – tema Clima, riscos e emergências) em que moradores registram riscos do bairro (alagamento, deslizamento etc.).

**Problema / cidadão:** moradores de áreas de risco recebem avisos tarde e desorganizados. ODS 11 e 13.

**Tecnologias:** HTML5 semântico, CSS3 (Flexbox/Grid, Mobile First), JavaScript puro (DOM, localStorage), Bootstrap 5 (CDN), Git/GitHub.

**Como executar:** abra a pasta no VS Code e use a extensão *Live Server* em `index.html` (ou abra o arquivo no navegador). Requer internet para carregar o Bootstrap.

**Estrutura**
```
index.html        página inicial
ocorrencias.html  formulário, lista (CRUD) e painel de log
sobre.html        problema, ODS, LGPD
css/style.css     estilos (mobile first + 3 larguras)
js/app.js         validação, adicionar/listar/editar/remover, log
```
**Segurança:** validação de toda entrada, erros sem detalhes técnicos, uso de `textContent` (sem `innerHTML`), coleta mínima de dados (LGPD), sem segredos no repositório.

**Prints das telas:** adicione aqui (celular, tablet, desktop).
