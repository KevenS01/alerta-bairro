// AlertaBairro — CRUD de ocorrências com DOM e localStorage
const CHAVE = "alertabairro:ocorrencias";
let ocorrencias = [];
let editandoId = null;

const form = document.getElementById("form");
const campos = {
  tipo: document.getElementById("tipo"),
  bairro: document.getElementById("bairro"),
  descricao: document.getElementById("descricao"),
  nivel: document.getElementById("nivel"),
};
const erroEl = document.getElementById("erro");
const listaEl = document.getElementById("lista");
const logEl = document.getElementById("log");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const filtroNivel = document.getElementById("filtro-nivel");
const buscaEl = document.getElementById("busca");
const resumoEl = document.getElementById("resumo");
const btnExportar = document.getElementById("btn-exportar");

// ---------- Registro de atividades ----------
function registrar(mensagem) {
  const agora = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const li = document.createElement("li");
  li.className = "list-group-item";
  li.textContent = agora + " — " + mensagem; // textContent evita injeção de HTML
  logEl.prepend(li);
}

// ---------- Armazenamento ----------
function carregar() {
  try {
    ocorrencias = JSON.parse(localStorage.getItem(CHAVE)) || [];
  } catch (e) {
    ocorrencias = [];
    erroEl.textContent = "Não foi possível carregar os dados. Tente novamente.";
    registrar("Falha ao carregar dados.");
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(ocorrencias));
    return true;
  } catch (e) {
    erroEl.textContent = "Não foi possível salvar. Tente novamente.";
    registrar("Falha ao salvar dados.");
    return false;
  }
}

// ---------- Validação ----------
function validar(d) {
  if (!d.tipo || !d.bairro || !d.descricao || !d.nivel) return "Preencha todos os campos.";
  if (d.bairro.length < 3 || d.bairro.length > 60) return "O bairro deve ter de 3 a 60 caracteres.";
  if (d.descricao.length < 10 || d.descricao.length > 300) return "A descrição deve ter de 10 a 300 caracteres.";
  if (!/^[\p{L}0-9 .'-]+$/u.test(d.bairro)) return "O bairro contém caracteres inválidos.";
  return "";
}

function lerFormulario() {
  return {
    tipo: campos.tipo.value.trim(),
    bairro: campos.bairro.value.trim(),
    descricao: campos.descricao.value.trim(),
    nivel: campos.nivel.value.trim(),
  };
}

// ---------- Operações: adicionar, listar, editar, remover ----------
function adicionar(dados) {
  ocorrencias.push({ id: Date.now(), ...dados });
  if (salvar()) registrar("Ocorrência adicionada com sucesso: " + dados.tipo + " em " + dados.bairro + ".");
}

function editar(id, dados) {
  const item = ocorrencias.find((o) => o.id === id);
  if (!item) { erroEl.textContent = "Item não encontrado."; return; }
  Object.assign(item, dados);
  if (salvar()) registrar("Ocorrência editada com sucesso: " + item.tipo + " em " + item.bairro + ".");
}

function remover(id) {
  const item = ocorrencias.find((o) => o.id === id);
  ocorrencias = ocorrencias.filter((o) => o.id !== id);
  if (salvar()) registrar("Ocorrência removida: " + (item ? item.tipo + " em " + item.bairro : "") + ".");
}

// BÔNUS: filtro por nível, busca por texto e resumo com contadores
function filtrar() {
  const nivel = filtroNivel.value;
  const termo = buscaEl.value.trim().toLowerCase();
  return ocorrencias.filter((o) => {
    const textoOk = (o.tipo + " " + o.bairro + " " + o.descricao).toLowerCase().includes(termo);
    return (nivel === "" || o.nivel === nivel) && textoOk;
  });
}

function atualizarResumo(mostradas) {
  const conta = (n) => ocorrencias.filter((o) => o.nivel === n).length;
  resumoEl.textContent = "Mostrando " + mostradas + " de " + ocorrencias.length +
    " — Alto: " + conta("Alto") + " | Médio: " + conta("Médio") + " | Baixo: " + conta("Baixo");
}

function listar() {
  listaEl.replaceChildren();
  const visiveis = filtrar();
  atualizarResumo(visiveis.length);
  if (visiveis.length === 0) {
    const p = document.createElement("p");
    p.className = "vazio";
    p.textContent = ocorrencias.length === 0 ? "Nenhuma ocorrência registrada." : "Nenhuma ocorrência encontrada com esse filtro.";
    listaEl.append(p);
    return;
  }
  visiveis.forEach((o) => listaEl.append(criarCard(o)));
}

// BÔNUS: exportar os dados em arquivo JSON (Blob + URL.createObjectURL)
function exportar() {
  erroEl.textContent = "";
  if (ocorrencias.length === 0) {
    erroEl.textContent = "Não há ocorrências para exportar.";
    registrar("Exportação cancelada: lista vazia.");
    return;
  }
  try {
    const blob = new Blob([JSON.stringify(ocorrencias, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocorrencias.json";
    a.click();
    URL.revokeObjectURL(url);
    registrar("Exportação concluída: " + ocorrencias.length + " ocorrência(s).");
  } catch (e) {
    erroEl.textContent = "Não foi possível exportar. Tente novamente.";
    registrar("Falha ao exportar dados.");
  }
}

function criarCard(o) {
  const card = document.createElement("article");
  card.className = "item " + o.nivel.toLowerCase().replace("é", "e");
  const h3 = document.createElement("h3");
  h3.textContent = o.tipo + " — " + o.bairro;
  const nivel = document.createElement("small");
  nivel.textContent = "Nível: " + o.nivel;
  const desc = document.createElement("p");
  desc.className = "mb-0";
  desc.textContent = o.descricao;
  const acoes = document.createElement("div");
  acoes.className = "acoes";
  const bEd = criarBotao("Editar", "btn btn-sm btn-outline-primary", () => iniciarEdicao(o.id));
  const bRm = criarBotao("Remover", "btn btn-sm btn-outline-danger", () => { remover(o.id); listar(); });
  acoes.append(bEd, bRm);
  card.append(h3, nivel, desc, acoes);
  return card;
}

function criarBotao(texto, classe, aoClicar) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = classe;
  b.textContent = texto;
  b.addEventListener("click", aoClicar);
  return b;
}

// ---------- Edição ----------
function iniciarEdicao(id) {
  const o = ocorrencias.find((x) => x.id === id);
  if (!o) return;
  editandoId = id;
  Object.keys(campos).forEach((k) => (campos[k].value = o[k]));
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.classList.remove("d-none");
  campos.tipo.focus();
}

function sairDaEdicao() {
  editandoId = null;
  form.reset();
  btnSalvar.textContent = "Adicionar";
  btnCancelar.classList.add("d-none");
}

// ---------- Eventos ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  erroEl.textContent = "";
  const dados = lerFormulario();
  const msg = validar(dados);
  if (msg) {
    erroEl.textContent = msg;
    registrar("Tentativa inválida: " + msg);
    return;
  }
  try {
    if (editandoId === null) adicionar(dados);
    else editar(editandoId, dados);
    sairDaEdicao();
    listar();
  } catch (err) {
    erroEl.textContent = "Não foi possível concluir a operação. Tente novamente.";
    registrar("Falha na operação.");
  }
});

btnCancelar.addEventListener("click", sairDaEdicao);
filtroNivel.addEventListener("change", listar);
buscaEl.addEventListener("input", listar);
btnExportar.addEventListener("click", exportar);

carregar();
listar();
registrar("Página carregada.");
