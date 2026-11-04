/* Mapa de Oferta: o codigo compartilhado pela ferramenta e pelas paginas de cada oferta.
   Uma pagina de oferta define window.OFERTA antes de carregar este arquivo, e a tela
   ja abre preenchida. Sem OFERTA, e a ferramenta em branco. */
var $ = function(id){ return document.getElementById(id); };

/* ---------- 01 · o mapa ---------- */
var CAMPOS = [
  ['publico',   'Para quem',            'Quem compra, em uma frase. Quanto mais específico, melhor.', 'Ex.: dentistas recém-formados que querem a primeira clínica'],
  ['dor',       'A dor',                'O problema que tira o sono dessa pessoa hoje.', 'O que ela já tentou e não deu certo?'],
  ['desejo',    'O desejo',             'Onde ela quer chegar. O “depois” que ela imagina.', ''],
  ['promessa',  'A promessa',           'Resultado + prazo, numa frase que caiba no anúncio.', 'Ex.: agenda cheia em 90 dias sem depender de convênio'],
  ['mecanismo', 'O mecanismo',          'Por que funciona, e por que é diferente do que ela já viu.', 'O nome do método, o passo que ninguém faz…'],
  ['entrega',   'O que ela recebe',     'O produto em si: módulos, encontros, formato, acesso.', ''],
  ['bonus',     'Bônus',                'O que soma valor sem custar caro para entregar.', ''],
  ['prova',     'Prova',                'Depoimentos, números, cases, autoridade de quem vende.', ''],
  ['garantia',  'Garantia e risco',     'O que tira o medo de comprar.', 'Ex.: 7 dias incondicional, ou garantia de resultado'],
  ['preco',     'Preço e condição',     'O valor, o parcelamento e o motivo para comprar agora.', 'Ex.: 12x de R$ 49,70, turma fecha dia 20']
];
var mapEl = $('map');
CAMPOS.forEach(function(c, i){
  var d = document.createElement('div');
  d.className = 'field';
  d.innerHTML = '<div class="top"><span class="k">' + String(i + 1).padStart(2, '0') + '</span>' +
    '<label for="m_' + c[0] + '">' + c[1] + '</label></div>' +
    '<p class="hint">' + c[2] + '</p>' +
    '<textarea id="m_' + c[0] + '" rows="3" placeholder="' + (c[3] || 'Escreva aqui') + '"></textarea>';
  mapEl.appendChild(d);
});
function atualizaMapa(){
  var n = 0;
  CAMPOS.forEach(function(c){
    var t = $('m_' + c[0]); var ok = t.value.trim().length > 0;
    t.closest('.field').classList.toggle('ok', ok); if(ok) n++;
  });
  $('mapCount').textContent = n + ' de ' + CAMPOS.length;
  $('mapBar').style.width = (n / CAMPOS.length * 100) + '%';
}
mapEl.addEventListener('input', atualizaMapa);

/* ---------- 02 · a margem ---------- */
/* aceita 1.234,56 ou 1234.56 */
function num(id){
  var v = $(id).value.replace(/[^\d,.\-]/g, '');
  if(v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.');
  var n = parseFloat(v); return isFinite(n) ? n : 0;
}
function vazio(id){ return $(id).value.trim() === ''; }
/* a moeda segue o mercado da oferta; brl() formata na moeda escolhida */
var MOEDA = 'BRL';
function brl(v){ return new Intl.NumberFormat('pt-BR', {style:'currency', currency:MOEDA}).format(v); }
var BRL0 = {format:function(v){ return new Intl.NumberFormat('pt-BR', {style:'currency', currency:MOEDA, maximumFractionDigits:0}).format(v); }};
function reais0(v){ return new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0}).format(v); }
function simbolo(m){
  var p = new Intl.NumberFormat('pt-BR', {style:'currency', currency:m}).formatToParts(0);
  for(var i = 0; i < p.length; i++) if(p[i].type === 'currency') return p[i].value;
  return m;
}
function trocaMoeda(m){
  MOEDA = m; $('moeda').value = m;
  document.querySelectorAll('.cur').forEach(function(el){ el.textContent = simbolo(m); });
  $('curCode').textContent = m;
  $('boxCambio').hidden = m === 'BRL';
  calcula();
}
$('moeda').addEventListener('change', function(){ trocaMoeda(this.value); });
function pct(v){ return (v * 100).toLocaleString('pt-BR', {maximumFractionDigits:1}) + '%'; }
function x(v){ return v.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) + '×'; }

var conta = null;   /* o ultimo calculo, usado pelo score e pelo resumo */
var SEGS = [
  ['Plataforma', 'var(--seg-1)'], ['Imposto', 'var(--seg-2)'], ['Comissão', 'var(--seg-3)'],
  ['Entrega', 'var(--seg-4)'], ['Tráfego', 'var(--seg-5)'], ['Lucro', 'var(--gold)']
];

function calcula(){
  var preco = num('preco'), extra = num('extra');
  var receita = preco + extra;
  var temPreco = !vazio('preco') && preco > 0;
  var temCpa = !vazio('cpa');
  var plataforma = receita * num('platPct') / 100 + (temPreco ? num('platFix') : 0);
  var imposto = receita * num('imposto') / 100;
  var comissao = preco * num('comissao') / 100;
  var entrega = num('entrega');
  var cpa = num('cpa');
  var liquido = receita - plataforma - imposto - comissao - entrega;  /* antes do trafego */
  var lucro = liquido - cpa;
  var margem = receita > 0 ? lucro / receita : 0;
  var alvo = num('alvo') / 100;
  var cpaAlvo = liquido - alvo * receita;
  var vendas = num('vendas');

  conta = temPreco ? {receita:receita, plataforma:plataforma, imposto:imposto,
    comissao:comissao, entrega:entrega, cpa:cpa, temCpa:temCpa, liquido:liquido,
    lucro:lucro, margem:margem, alvo:alvo, cpaAlvo:cpaAlvo, vendas:vendas} : null;

  if(!conta){
    ['oLucro','oCpaMax','oCpaAlvo','oRoasMin','oRoas','mFat','mAds','mLucro'].forEach(function(id){ $(id).textContent = '—'; $(id).classList.remove('neg'); });
    $('oMargem').textContent = 'margem líquida';
    $('oReceita').textContent = brl(0);
    $('boxLucroBrl').hidden = true;
    pintaBarra([0,0,0,0,0,0], 0);
    atualizaScore(); return;
  }

  $('oReceita').textContent = brl(receita);
  $('oCpaMax').textContent = liquido > 0 ? brl(liquido) : 'não fecha';
  $('oCpaMax').classList.toggle('neg', liquido <= 0);
  $('oCpaAlvo').textContent = cpaAlvo > 0 ? brl(cpaAlvo) : 'inviável';
  $('oCpaAlvo').classList.toggle('neg', cpaAlvo <= 0);
  $('oCpaAlvoNote').textContent = 'para ficar com ' + pct(alvo) + ' de margem';
  $('oRoasMin').textContent = liquido > 0 ? x(receita / liquido) : '—';

  if(temCpa){
    $('oLucro').textContent = brl(lucro);
    $('oLucro').classList.toggle('neg', lucro < 0);
    $('oMargem').textContent = pct(margem) + ' de margem líquida';
    $('oRoas').textContent = cpa > 0 ? x(receita / cpa) : '—';
    $('oRoasNote').textContent = cpa > 0 ? (receita / cpa >= receita / liquido ? 'acima do empate' : 'abaixo do empate: está perdendo') : 'com o CPA informado';
  } else {
    $('oLucro').textContent = brl(liquido);
    $('oLucro').classList.toggle('neg', liquido < 0);
    $('oMargem').textContent = 'antes do tráfego · informe o CPA';
    $('oRoas').textContent = '—';
    $('oRoasNote').textContent = 'informe o CPA';
  }

  if(vendas > 0){
    $('mFat').textContent = BRL0.format(receita * vendas);
    $('mAds').textContent = BRL0.format(cpa * vendas);
    $('mLucro').textContent = BRL0.format(lucro * vendas);
    $('mLucro').classList.toggle('neg', lucro < 0);
  } else { ['mFat','mAds','mLucro'].forEach(function(id){ $(id).textContent = '—'; }); }
  var cambio = num('cambio');
  var mostraBrl = MOEDA !== 'BRL' && cambio > 0 && vendas > 0;
  $('boxLucroBrl').hidden = !mostraBrl;
  if(mostraBrl){
    $('mLucroBrl').textContent = reais0(lucro * vendas * cambio);
    $('mLucroBrl').classList.toggle('neg', lucro < 0);
  }
  conta.cambio = MOEDA !== 'BRL' && cambio > 0 ? cambio : 0;

  pintaBarra([plataforma, imposto, comissao, entrega, cpa, lucro], receita);
  atualizaScore();
}

function pintaBarra(vals, receita){
  var custos = vals.slice(0, 5).reduce(function(a, b){ return a + b; }, 0);
  var lucro = vals[5];
  var total = Math.max(receita, custos);   /* no prejuizo, a barra mostra o rombo */
  var is = $('track').children;
  for(var i = 0; i < 5; i++) is[i].style.flexBasis = total > 0 ? (vals[i] / total * 100) + '%' : '0%';
  /* no prejuizo os custos enchem a barra inteira e a linha da receita
     mostra onde o dinheiro acabou */
  is[5].style.flexBasis = total > 0 && lucro > 0 ? (lucro / total * 100) + '%' : '0%';
  var linha = $('linhaReceita');
  linha.hidden = !(lucro < 0 && total > 0);
  if(!linha.hidden) linha.style.left = (receita / total * 100) + '%';
  var leg = '';
  SEGS.forEach(function(s, k){
    var v = vals[k];
    var nome = k === 5 && v < 0 ? 'Prejuízo' : s[0];
    var cor = k === 5 && v < 0 ? 'var(--ruim)' : s[1];
    leg += '<div><i style="background:' + cor + '"></i>' + nome + '<b>' +
      (receita > 0 ? brl(Math.abs(v)) + ' · ' + pct(Math.abs(v) / receita) : '—') + '</b></div>';
  });
  $('legend').innerHTML = leg;
}

document.querySelector('.calc').addEventListener('input', calcula);

/* ---------- 03 · o score ---------- */
/* RASCUNHO: criterios e pesos sao proposta inicial, para a equipe ajustar */
var CRITERIOS = [
  ['dor',       'Dor urgente e reconhecida',      'O público sabe que tem o problema e quer resolver agora, não “um dia”.', 3, 'nem percebe o problema', 'quer resolver hoje'],
  ['promessa',  'Promessa clara e específica',    'Resultado concreto, com prazo, que cabe numa frase de anúncio.', 3, 'vaga', 'cristalina'],
  ['publico',   'Público alcançável e com dinheiro', 'Dá para achar essa pessoa no tráfego e ela pode pagar o preço.', 2, 'difícil de achar', 'fácil e com verba'],
  ['mercado',   'Encaixe com o mercado',          '', 2, 'não conversa', 'feita para ele'],
  ['mecanismo', 'Mecanismo único',                'Existe um “porquê funciona” que soa novo para quem já tentou de tudo.', 2, 'mais do mesmo', 'inédito'],
  ['prova',     'Prova',                          'Depoimentos, números e cases que sustentam a promessa.', 2, 'nenhuma', 'de sobra'],
  ['valor',     'Valor percebido acima do preço', 'Quem compra sente que está pagando pouco pelo que leva.', 2, 'caro', 'barato pelo que é'],
  ['risco',     'Risco baixo para quem compra',   'Garantia, bônus e condição de pagamento tiram o medo.', 1, 'arriscado', 'sem risco'],
  ['diferenca', 'Diferente da concorrência',      'Não é só mais um produto igual aos que o público já viu.', 1, 'igual a todos', 'sem concorrente direto'],
  ['margem',    'Margem por venda',               'Vem da calculadora: quanto sobra de cada venda depois do tráfego.', 2, '', '', true]
];
var notas = {};
var critsEl = $('crits');
CRITERIOS.forEach(function(c){
  var d = document.createElement('div');
  d.className = 'crit'; d.id = 'c_' + c[0];
  var alto = c[3] >= 3;
  var html = '<div class="t"><div><b>' + c[1] + '</b><p id="d_' + c[0] + '">' + c[2] + '</p></div>' +
    '<span class="peso' + (alto ? ' alto' : '') + '">Peso ' + c[3] + '</span></div>';
  if(c[6]){
    html += '<div class="auto" id="autoMargem">Preencha preço e CPA na calculadora.</div>';
  } else {
    html += '<div class="rate" role="group" aria-label="' + c[1] + '">';
    for(var n = 0; n <= 5; n++) html += '<button type="button" data-c="' + c[0] + '" data-n="' + n + '" aria-pressed="false">' + n + '</button>';
    html += '</div><div class="rate-ends"><span>' + c[4] + '</span><span>' + c[5] + '</span></div>';
  }
  d.innerHTML = html;
  critsEl.appendChild(d);
});
critsEl.addEventListener('click', function(e){
  var b = e.target.closest('button[data-c]'); if(!b) return;
  var c = b.dataset.c, n = +b.dataset.n;
  notas[c] = notas[c] === n ? undefined : n;   /* clicar de novo desmarca */
  b.parentNode.querySelectorAll('button').forEach(function(o){
    o.setAttribute('aria-pressed', String(notas[c] === +o.dataset.n));
  });
  $('c_' + c).classList.toggle('done', notas[c] !== undefined);
  atualizaScore();
});

/* margem liquida -> nota de 0 a 5 */
function notaMargem(){
  if(!conta || !conta.temCpa) return undefined;
  var m = conta.margem;
  return m >= .40 ? 5 : m >= .30 ? 4 : m >= .20 ? 3 : m >= .10 ? 2 : m > 0 ? 1 : 0;
}

var FAIXAS = [
  [80, 'bom',    'Oferta forte',          'Pode subir o teste com confiança.'],
  [65, 'at',     'Pode testar',           'Sobe com verba controlada e acompanha de perto.'],
  [50, 'ajuste', 'Ajustar antes de subir', 'Tem base, mas os pontos abaixo vão custar caro no tráfego.'],
  [0,  'ruim',   'Não sobe ainda',        'Volte ao mapa antes de colocar dinheiro.']
];
var COR = {bom:'var(--bom)', at:'var(--gold)', ajuste:'var(--atencao)', ruim:'var(--ruim)'};
var resultado = null;

function atualizaScore(){
  var nm = notaMargem();
  notas.margem = nm;
  var am = $('autoMargem');
  if(nm === undefined){
    am.innerHTML = 'Preencha preço e CPA na calculadora.';
    $('c_margem').classList.remove('done');
  } else {
    am.innerHTML = '<strong>' + nm + '</strong> de 5 · margem de ' + pct(conta.margem) + ' por venda';
    $('c_margem').classList.add('done');
  }

  var soma = 0, max = 0, n = 0, gaps = [];
  CRITERIOS.forEach(function(c){
    var v = notas[c[0]]; if(v === undefined) return;
    n++; soma += v * c[3]; max += 5 * c[3];
    if(v < 5) gaps.push({nome:c[1], perde:(5 - v) * c[3], nota:v});
  });

  var fg = $('gaugeFg'), C = 276.46;
  if(n === 0){
    resultado = null;
    $('scoreNum').textContent = '—'; $('navScore').textContent = '—';
    $('navScore').className = 'pill';
    fg.style.strokeDashoffset = C; fg.style.stroke = 'var(--mute)';
    $('band').textContent = 'Comece pelas notas';
    $('bandNote').textContent = '0 de ' + CRITERIOS.length + ' critérios avaliados';
    $('fixBox').hidden = true; return;
  }

  var score = Math.round(soma / max * 100);
  var f = FAIXAS.filter(function(fx){ return score >= fx[0]; })[0];
  var nota = f[3];
  /* trava: se cada venda da prejuizo, nao importa o resto */
  if(nm === 0){ f = FAIXAS[3]; nota = 'A conta não fecha: cada venda dá prejuízo com esse CPA.'; }
  var parcial = n < CRITERIOS.length;

  resultado = {score:score, faixa:f[2], nota:nota, parcial:parcial, n:n};
  $('scoreNum').textContent = score; $('navScore').textContent = score;
  $('navScore').className = 'pill ' + f[1];
  fg.style.strokeDashoffset = C * (1 - score / 100);
  fg.style.stroke = COR[f[1]];
  $('band').textContent = f[2];
  $('band').style.color = COR[f[1]];
  $('bandNote').textContent = parcial && nm !== 0 ? 'Parcial: ' + n + ' de ' + CRITERIOS.length + ' critérios avaliados.' : nota;

  gaps.sort(function(a, b){ return b.perde - a.perde; });
  var top = gaps.slice(0, 3);
  $('fixBox').hidden = top.length === 0;
  $('fix').innerHTML = top.map(function(g){
    return '<li><span>' + g.nome + '<small>nota ' + g.nota + ' · deixa ' + Math.round(g.perde / max * 100) + ' pontos na mesa</small></span></li>';
  }).join('');
}

/* ---------- mercado ---------- */
var MERCADO = 'br';
var MERCADOS = {
  br:     {nome:'Brasil', ph:'', desc:'A promessa e a linguagem soam brasileiras, e o público daqui ainda não está cansado dessa promessa.'},
  pais:   {nome:'Outro país', ph:'Qual país? Ex.: Portugal, EUA, México', desc:'Idioma, cultura e poder de compra desse país combinam com a promessa e com o preço, e a oferta não é só uma tradução.'},
  global: {nome:'Global', ph:'Países principais (opcional)', desc:'A oferta funciona em vários países sem depender de algo só do Brasil, e o preço cabe no bolso dos países-alvo.'}
};
function nomeMercado(){
  var p = $('pais').value.trim();
  if(MERCADO === 'br') return 'Brasil';
  if(MERCADO === 'pais') return p || 'Outro país';
  return 'Global' + (p ? ' (' + p + ')' : '');
}
function trocaMercado(m){
  MERCADO = m;
  $('mercado').querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-checked', String(b.dataset.m === m)); });
  $('pais').hidden = m === 'br';
  $('pais').placeholder = MERCADOS[m].ph;
  $('d_mercado').textContent = MERCADOS[m].desc;
  /* Brasil vende em real; fora, o padrao e dolar ate alguem trocar */
  if(m === 'br') trocaMoeda('BRL');
  else if(MOEDA === 'BRL') trocaMoeda('USD');
}
$('mercado').addEventListener('click', function(e){
  var b = e.target.closest('button[data-m]'); if(b) trocaMercado(b.dataset.m);
});

/* ---------- resumo e limpeza ---------- */
function resumo(){
  var L = [];
  var nome = $('nome').value.trim() || 'Oferta sem nome';
  L.push('MAPA DE OFERTA · ' + nome.toUpperCase(), 'Mercado: ' + nomeMercado() + ' · moeda ' + MOEDA);
  if($('depLink').value.trim()) L.push('Página: ' + $('depLink').value.trim());
  L.push('');
  CAMPOS.forEach(function(c){
    var v = $('m_' + c[0]).value.trim();
    if(v) L.push(c[1] + ': ' + v.replace(/\s*\n\s*/g, ' / '));
  });
  if(conta){
    L.push('', 'MARGEM (por venda)');
    L.push('Receita: ' + brl(conta.receita));
    L.push('Fica antes do tráfego: ' + brl(conta.liquido) + ' (CPA máximo)');
    if(conta.temCpa) L.push('CPA: ' + brl(conta.cpa) + ' → lucro ' + brl(conta.lucro) + ' (' + pct(conta.margem) + ')');
    if(conta.cambio && conta.vendas > 0) L.push('Lucro do mês em reais (cotação ' + conta.cambio.toLocaleString('pt-BR') + '): ' + reais0(conta.lucro * conta.vendas * conta.cambio));
    if(conta.cpaAlvo > 0) L.push('CPA para ' + pct(conta.alvo) + ' de margem: ' + brl(conta.cpaAlvo));
  }
  if(resultado){
    L.push('', 'SCORE: ' + resultado.score + '/100 · ' + resultado.faixa + (resultado.parcial ? ' (parcial, ' + resultado.n + ' de ' + CRITERIOS.length + ')' : ''));
    CRITERIOS.forEach(function(c){ if(notas[c[0]] !== undefined) L.push('· ' + c[1] + ': ' + notas[c[0]] + '/5'); });
  }
  return L.join('\n');
}
function avisa(t){ $('toast').textContent = t; clearTimeout(avisa.t); avisa.t = setTimeout(function(){ $('toast').textContent = ''; }, 2600); }
function copia(txt, msg, onde){
  var ok = function(){ (onde || avisa)(msg); };
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(txt).then(ok, function(){ fallback(txt, ok); });
  } else fallback(txt, ok);
}
$('copiar').addEventListener('click', function(){ copia(resumo(), 'Resumo copiado'); });
function fallback(txt, ok){
  var t = document.createElement('textarea'); t.value = txt; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select();
  try{ document.execCommand('copy'); ok(); }catch(e){ avisa('Não deu para copiar'); }
  t.remove();
}
function temAlgo(){
  if($('nome').value.trim() || $('pais').value.trim() || $('depLink').value.trim()) return true;
  if(CAMPOS.some(function(c){ return $('m_' + c[0]).value.trim(); })) return true;
  if(!vazio('preco') || !vazio('cpa')) return true;
  return CRITERIOS.some(function(c){ return !c[6] && notas[c[0]] !== undefined; });
}
$('limpar').addEventListener('click', function(){
  /* numa pagina de oferta, o botao devolve a oferta como ela veio */
  if(window.OFERTA){
    if(sujo && !confirm('Desfazer suas mudanças e voltar à oferta como ela veio?')) return;
    aplicaOferta(window.OFERTA); window.scrollTo(0, 0); avisa('Oferta restaurada'); return;
  }
  if(temAlgo() && !confirm('Apagar tudo e começar outra oferta? Copie o resumo antes se quiser guardar.')) return;
  $('nome').value = ''; $('pais').value = ''; $('cambio').value = ''; $('depLink').value = '';
  CAMPOS.forEach(function(c){ $('m_' + c[0]).value = ''; });
  ['preco','extra','cpa','vendas'].forEach(function(id){ $(id).value = ''; });
  notas = {};
  document.querySelectorAll('.rate button').forEach(function(b){ b.setAttribute('aria-pressed', 'false'); });
  document.querySelectorAll('.crit').forEach(function(c){ c.classList.remove('done'); });
  trocaMercado('br'); atualizaMapa(); calcula(); window.scrollTo(0, 0); avisa('Pronto para a próxima');
});
/* nada e salvo: avisa antes de fechar com coisa preenchida */
/* ---------- 04 · depurador ---------- */
function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]; }); }
var PRIO = {alta:'Alta', media:'Média', baixa:'Baixa'};
function mostraDepurador(d){
  d = d || {};
  var ach = d.achados || [], refs = d.referencias || [];
  $('achados').innerHTML = ach.length ? ach.map(function(a){
    var p = PRIO[a.prioridade] ? a.prioridade : 'baixa';
    return '<article class="achado"><div class="t"><b>' + esc(a.titulo) + '</b><span class="prio ' + p + '">' + PRIO[p] + '</span></div>' +
      '<dl><div><dt>O que vimos</dt><dd>' + esc(a.vimos) + '</dd></div>' +
      '<div><dt>O que fazer</dt><dd class="fazer">' + esc(a.fazer) + '</dd></div></dl></article>';
  }).join('') : '<p class="vazio">Nenhum diagnóstico ainda. A resposta da análise vira esta lista na página da oferta.</p>';
  $('refs').innerHTML = refs.length ? refs.map(function(r){
    return '<div class="ref"><b>' + esc(r.nome) + '</b>' + (r.url ? '<span class="url">' + esc(r.url) + '</span>' : '') + '<p>' + esc(r.porque) + '</p></div>';
  }).join('') : '<p class="vazio">Sem referências ainda.</p>';
  $('depVer').hidden = !d.versao;
  $('depVer').textContent = d.versao ? 'Diagnóstico ' + d.versao : '';
}
function depToast(t){ $('depToast').textContent = t; clearTimeout(depToast.t); depToast.t = setTimeout(function(){ $('depToast').textContent = ''; }, 2600); }

/* o pedido que vai para o Claude (e, depois, para os subagentes) */
function pedido(){
  var link = $('depLink').value.trim();
  var d = (window.OFERTA && window.OFERTA.depurador) || {};
  var L = [
    'Você é estrategista de direct response da APEX. Analise a oferta abaixo e me devolva:',
    '1. Os problemas que mais custam venda, por prioridade (alta, média, baixa). Para cada um: título, o que você viu e o que fazer.',
    '2. Até 5 referências para estudar (empresas, ofertas ou páginas parecidas), com o porquê de cada uma.',
    '3. A nota de 0 a 5 que você daria em cada critério do score, com uma linha de justificativa.',
    'Não invente número que não está na página ou nos dados abaixo; quando faltar, diga o que falta.',
    '',
    'Link da oferta: ' + (link || '(sem link: analise só os dados abaixo)'),
    '',
    resumo()
  ];
  var ach = d.achados || [];
  if(ach.length){
    L.push('', 'JÁ ACHADO ANTES (confirme, descarte ou aprofunde):');
    ach.forEach(function(a){ L.push('· [' + (PRIO[a.prioridade] || 'Baixa') + '] ' + a.titulo + ': ' + a.fazer); });
  }
  L.push('', 'CRITÉRIOS DO SCORE: ' + CRITERIOS.map(function(c){ return c[1] + ' (peso ' + c[3] + ')'; }).join('; ') + '.');
  return L.join('\n');
}
$('pedir').addEventListener('click', function(){ copia(pedido(), 'Pedido copiado: cole no Claude', depToast); });

/* "sujo" = alguem mexeu desde que a pagina abriu */
var sujo = false;
document.addEventListener('input', function(){ sujo = true; });
document.addEventListener('click', function(e){ if(e.target.closest('.rate button, #mercado button')) sujo = true; });
addEventListener('beforeunload', function(e){ if(sujo && temAlgo()){ e.preventDefault(); e.returnValue = ''; } });

/* ---------- pagina de oferta: a tela abre preenchida ---------- */
function poe(id, v){ if(v !== undefined && v !== null && $(id)) $(id).value = String(v); }
function aplicaOferta(o){
  poe('nome', o.nome || '');
  trocaMercado(o.mercado || 'br');
  poe('pais', o.pais || '');
  if(o.moeda) trocaMoeda(o.moeda);
  poe('cambio', o.cambio || '');
  CAMPOS.forEach(function(c){ poe('m_' + c[0], (o.mapa || {})[c[0]] || ''); });
  var m = o.margem || {};
  ['preco','extra','platPct','platFix','imposto','comissao','entrega','cpa','alvo','vendas'].forEach(function(id){
    if(m[id] !== undefined) poe(id, m[id]);
  });
  notas = {};
  var n = o.notas || {};
  CRITERIOS.forEach(function(c){
    if(c[6]) return;
    var v = n[c[0]];
    if(typeof v === 'number' && v >= 0 && v <= 5) notas[c[0]] = v;
    var box = $('c_' + c[0]);
    box.querySelectorAll('.rate button').forEach(function(b){ b.setAttribute('aria-pressed', String(notas[c[0]] === +b.dataset.n)); });
    box.classList.toggle('done', notas[c[0]] !== undefined);
  });
  poe('depLink', o.link || '');
  mostraDepurador(o.depurador);
  if($('fonte')){
    $('fonte').hidden = !o.link;
    $('fonteUrl').textContent = o.link || '';
  }
  atualizaMapa(); calcula();
  sujo = false;
}

trocaMercado('br'); atualizaMapa(); calcula();
if(window.OFERTA) aplicaOferta(window.OFERTA);
