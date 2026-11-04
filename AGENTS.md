# APEX — `app.marketingapex.com.br`

Instruções do projeto. Quem abrir esta pasta lê isto automaticamente, de
qualquer máquina e de qualquer conta.

Atualize junto com o código: decisão que não está escrita aqui some na primeira
troca de mão.

---

## O que é

Página do subdomínio `app` da Apex. **HTML estático**, sem build, sem framework,
sem dependência.

```
index.html          a raiz — página mínima da marca, sem link nenhum
404.html            a página de erro, mesma cara
relatoriozeus/      o relatório de um cliente, uma pasta por cliente
oferta/             ferramenta interna: mapa de oferta, margem e score
oferta/<nome>/      a mesma tela, já preenchida com uma oferta
referencia/         o site institucional clonado, NÃO publicado
vercel.json         cleanUrls e trailingSlash
.vercelignore       o que não vai para o ar
```

## `referencia/` — material de design, não página

Ali dentro está a cópia do site que está no ar em `www.marketingapex.com.br`,
que foi o ponto de partida deste projeto. **O `.vercelignore` impede que ela
seja publicada**: o arquivo continua no Git e no disco, mas não é servido na
web.

É de lá que sai a construção das próximas páginas — copiar de `referencia/`
em vez de clonar o site de novo. Apagar só quando o layout próprio estiver
decidido, e essa é decisão de quem é dono.

## Uma página por cliente, sem saída

Cada cliente ganha uma pasta com `index.html` dentro — pasta, e não arquivo
solto, porque o `vercel.json` usa `trailingSlash`.

**A página do cliente não tem navegação.** Sem menu, sem link que saia dela,
e com `noindex, nofollow` para não entrar em busca. O cliente abre o link,
vê o que é dele, e não há por onde circular. Vale até o portal oficial
existir.

O `index.html` nasceu como cópia do site no ar em `www.marketingapex.com.br`.
A identidade visual mora nas variáveis CSS do `<style>` dele — `--ink`, `--fg`,
`--gold` e as demais. **Cor nova se declara como variável ali**, não solta no
meio do documento.

⚠ **O repositório `apex-assessoria/site` tem a paleta antiga** (`#E79E14`,
Inter) e não serve de referência visual para nada aqui.

## `oferta/` — ferramenta interna da equipe

Mapa de oferta, calculadora de margem (infoproduto) e score de 0 a 100.
Mesmas regras da página de cliente: `noindex`, sem menu, sem link de saída, e
fora do `index.html` da raiz — quem usa recebe o link.

**Nada é salvo**, nem no navegador: o que guarda o trabalho é o botão
"Copiar resumo". Isso é de propósito, pela regra abaixo.

Os critérios e pesos do score estão no array `CRITERIOS` do script, marcados
como **rascunho**: proposta inicial, ainda não validada com resultado de
campanha. As taxas da calculadora (9,9% + R$ 1,00 de plataforma, 6% de imposto)
são só valor de partida, editável na tela.

O **mercado** (Brasil, outro país ou global, com o país escrito) troca a moeda
da calculadora — Brasil fica em real, fora vira dólar até alguém escolher outra —
e, com cotação informada, mostra o lucro do mês em reais. Ele também ajusta o
texto do critério "Encaixe com o mercado" no score.

### Página de uma oferta

O visual e o código moram em `oferta/oferta.css` e `oferta/oferta.js`, e
**servem a ferramenta e todas as ofertas**: melhoria feita ali vale para todas.

Cada oferta é uma pasta `oferta/<nome>/`, copiada de `oferta/_modelo/` (que o
`.vercelignore` não publica). O que muda de uma para outra é só o bloco
`window.OFERTA` no fim do arquivo: nome, link da página de vendas, mercado,
os dez campos do mapa, as entradas da margem e as notas do score. A tela abre
preenchida, dá para simular por cima, e "Voltar ao original" desfaz.

O link da página de vendas aparece como texto, não como link clicável: a
regra de não ter saída vale aqui também.

### O depurador (bloco 04)

Onde a oferta melhora. Tem o link da página de vendas, o que já foi achado
(cada achado com prioridade, "o que vimos" e "o que fazer") e as referências
para estudar. Os achados e as referências moram em `window.OFERTA.depurador`,
e cada rodada de análise ganha uma `versao`.

O botão **"Copiar pedido de análise"** monta o texto que vai para o Claude:
o link, o resumo da oferta, o que já foi achado e os critérios do score. A
resposta volta para o bloco `depurador` da página. É a porta por onde os
subagentes vão entrar depois — a página continua sem servidor.

Ofertas publicadas:

```
oferta/tv-restaurante/   vídeos com IA para a TV de restaurante e hamburgueria
```

## O que este projeto não tem, de propósito

Não há servidor, banco de dados nem etapa de build. **Nenhuma página grava dado
nenhum.** Se algo pedir formulário que persiste, é projeto novo, não é esta
página — e a decisão de onde ele mora vem antes do código.

## A regra que explica a estrutura

**Transferência não é migração.** Um repositório por projeto, nunca um
repositório só para tudo — é o que permite um projeto sair sem levar o histórico
do vizinho. Projeto novo nasce como pasta irmã desta, com `git init` próprio.

## Como contribuir sem atropelar o deploy

O deploy sai do Git. Push direto no branch de produção **publica sem ninguém
ver**.

```
git switch -c <autor>/<o-que-mudou>
git push -u origin <autor>/<o-que-mudou>
gh pr create
```

O Pull Request é o ponto de entrega: quem é dono revisa e faz o merge, e **o
merge é que publica**.

## O DNS deste subdomínio

A zona fica no registro.br e o apontamento é por **CNAME no nome `app`**, com o
valor que o painel da Vercel mostrar para este projeto.

⚠ **O nameserver nunca é apontado para a Vercel.** O DNSSEC está ligado no
`marketingapex.com.br` e a Vercel não assina zona: trocar nameserver faz o
domínio inteiro parar de resolver — site e e-mail, para todo mundo.

## O que nunca entra em commit

`.env` e variantes, `node_modules/`, `.vercel/` — já cobertos pelo
`.gitignore`. Chave de API, token e senha não entram neste repositório.

`.claude/settings.local.json` é pessoal de cada máquina e fica de fora.

## ⚠ Este repositório é público, e por quê

Ele nasceu privado e foi aberto em 29/10/2026. O motivo é concreto: **o plano
Hobby da Vercel não faz deploy de repositório privado que pertence a uma
organização.** A escolha era abrir o repositório ou subir o plano, e abrir saiu
de graça porque o conteúdo daqui já é público — é cópia do que está servido em
`www.marketingapex.com.br`. É a mesma escolha que o repositório `site` fez.

O que decorre disso:

```
pode entrar     a página, o texto, o que já está no ar
não pode        chave, token, senha, dado de cliente
```

O método da casa — nomenclatura, abertura de cliente, padrões de trabalho —
mora no repositório `contexto`, que é privado. Regra escrita aqui fica legível
por qualquer pessoa, e **fechar o repositório depois não apaga o que já foi
lido ou clonado**.
