const form = document.getElementById('form');
const description = document.getElementById('description');
const value = document.getElementById('value');
const movementType = document.getElementById('movement-type');
const selectCategory = document.getElementById('select-category');

const listMovement = document.getElementById('list-movement');

const updateEntries = document.getElementById('update-entries');
const updateOutputs = document.getElementById('update-outputs');
const updateBalance = document.getElementById('update-balance');

const btnText = document.getElementById('btn-text');

const movimentacoes = [];

let indiceEdicao = null; // Variável para armazenar o índice da movimentação em edição

// Criando o formatador padrão para Real Brasileiro
const formatarMoeda = (valor) => {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

//criando um obejto de mapeamento para as categorias, onde a chave é o valor do select e o valor é o nome formatado da categoria
const categoriasFormatadas = {
  salary: 'Salário',
  food: 'Alimentação',
  transport: 'Transporte',
  leisure: 'Lazer',
  travels: 'Viagens',
  others: 'Outros',
};

//criando um objeto para mapear as classes de acordo com o tipo de movimentação
const classesValor = {
  entry: 'valorEntry',
  output: 'valorOutput',
};

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const descriptionValue = description.value.trim();
  const valueInput = Number(value.value);
  const movementTypeValue = movementType.value;
  const categoryValue = selectCategory.value;

  if (
    !descriptionValue ||
    //!valueInput ||
    !value.value ||
    !movementTypeValue ||
    !categoryValue
  ) {
    mostrarToast('Preencha todos os campos!', 'aviso');
    return;
  }

  if (valueInput <= 0) {
    mostrarToast('O valor precisa ser maior que zero!', 'aviso');
    return;
  }

  const dadosMovimentacao = {
    descricao: descriptionValue,
    valor: valueInput,
    tipo: movementTypeValue,
    categoria: categoryValue,
  };

  // Verifica se estamos editando uma movimentação existente ou adicionando uma nova
  if (indiceEdicao !== null) {
    movimentacoes[indiceEdicao] = dadosMovimentacao; // Atualiza a movimentação existente no array com os novos dados
    mostrarToast('Item foi editado com sucesso!', 'sucesso');
  } else {
    movimentacoes.push(dadosMovimentacao);
    mostrarToast('Item adicionado com sucesso!', 'sucesso');
  }

  desativarModoEdicao();

  salvarNoLocalStorage(); // Salva os lançamentos no localStorage após adicionar uma nova movimentação

  console.log('dados movimentações' + dadosMovimentacao);
  console.log('movimentações' + movimentacoes);

  renderizarMovimentacoes();
  atualizarResumo();
  limparFormulario();
});

function renderizarMovimentacoes() {
  listMovement.innerHTML = '';
  movimentacoes.forEach((item, index) => {
    const listaLi = document.createElement('li');
    listaLi.dataset.index = index;

    //Criando uma estrutura para adicionar a classe de acordo com o tipo de movimentação (entrada ou saída)
    /*    let obterClasse = '';

    if (item.tipo === 'entry') {
      obterClasse = 'valorEntry';
    } else {
      obterClasse = 'valorOutput';
    }
 */
    //Utilizando o objeto de mapeamento para obter a classe de acordo com o tipo de movimentação
    const classeTipo = classesValor[item.tipo];

    const tipoFormatado = item.tipo === 'entry' ? 'Entrada' : 'Saída';

    //Utilizando o objeto de mapeamento para obter a categoria formatada de acordo com o valor do select
    const categoriaFormatada = categoriasFormatadas[item.categoria];

    listaLi.innerHTML = `${item.descricao} - <span class="${classeTipo}">${formatarMoeda(item.valor)}</span> - ${tipoFormatado} - ${categoriaFormatada} <i class="icon-action icon-edit fa-regular fa-pen-to-square"></i> <i class="icon-action icon-trash fa-solid fa-trash"></i>`;

    listMovement.appendChild(listaLi);
  });
}

function limparFormulario() {
  description.value = '';
  value.value = '';
  movementType.value = '';
  selectCategory.value = '';
}

//===============================================================================
/* const entradas = movimentacoes.filter((entrada) => {
  return entrada.tipo === 'entry';
});
console.log('Entradas:', entradas);

const saidas = movimentacoes.filter((saida) => {
  return saida.tipo === 'output';
});
console.log('Saidas:', saidas);

const totalEntradas = entradas.reduce((acumulador, movimentacaoAtual) => {
  return acumulador + movimentacaoAtual.valor;
}, 0);
console.log('Total Entrada:', totalEntradas);

const totalSaidas = saidas.reduce((acumulador, movimentacaoAtual) => {
  return acumulador + movimentacaoAtual.valor;
}, 0);
console.log('Total Saida:', totalSaidas);

const saldo = totalEntradas - totalSaidas;
console.log('Saldo:', saldo); */
//===============================================================================

function atualizarResumo() {
  /*   let totalEntradas = 0;
  let totalSaidas = 0;
  let totalSaldo = 0; 

  movimentacoes.forEach((movimentacao) => {
    if (movimentacao.tipo === 'entry') {
      totalEntradas += movimentacao.valor;
    } else if (movimentacao.tipo === 'output') {
      totalSaidas += movimentacao.valor;
    }
  });

  totalSaldo = totalEntradas - totalSaidas; */

  //Refatoração da função AtualizarResumo usando filter e reduce
  const entradas = movimentacoes.filter((entrada) => {
    return entrada.tipo === 'entry';
  });

  const saidas = movimentacoes.filter((saida) => {
    return saida.tipo === 'output';
  });

  const totalEntradas = entradas.reduce((acumulador, movimentacaoAtual) => {
    return acumulador + movimentacaoAtual.valor;
  }, 0);

  const totalSaidas = saidas.reduce((acumulador, movimentacaoAtual) => {
    return acumulador + movimentacaoAtual.valor;
  }, 0);

  const saldo = totalEntradas - totalSaidas;

  updateEntries.textContent = formatarMoeda(totalEntradas);
  updateOutputs.textContent = formatarMoeda(totalSaidas);
  updateBalance.textContent = formatarMoeda(saldo);
}

// Função para salvar os lançamentos no localStorage
function salvarNoLocalStorage() {
  const lancamentosJSON = JSON.stringify(movimentacoes); // Converte o array de lançamentos em uma string JSON
  localStorage.setItem('lancamentos', lancamentosJSON); // Salva a string JSON no localStorage com a chave 'lancamentos'
}

function carregarDoLocalStorage() {
  const carregamentoJSON = localStorage.getItem('lancamentos'); // Recupera a string JSON do localStorage com a chave 'lancamentos'

  if (carregamentoJSON) {
    // Verifica se há dados salvos no localStorage
    const carregamentoRecuperado = JSON.parse(carregamentoJSON); // Converte a string JSON de volta para um array de objetos
    movimentacoes.push(...carregamentoRecuperado); // Adiciona os lançamentos recuperados ao array de movimentações
  }
}

function ativarModoEdicao(movimentacao, index) {
  // Preenche o formulário com os dados da movimentação a ser editada
  description.value = movimentacao.descricao;
  value.value = movimentacao.valor;
  movementType.value = movimentacao.tipo;
  selectCategory.value = movimentacao.categoria;

  indiceEdicao = index; // Armazena o índice da movimentação em edição

  btnText.textContent = 'Salvar';
}

function desativarModoEdicao() {
  indiceEdicao = null; // Reseta o índice de edição após a atualização
  btnText.textContent = 'Adicionar';
}

function mostrarToast(mensagem, tipo) {
  const mensagemToast = document.createElement('div');
  const iconeNotificacoes = document.createElement('i');
  const spanToast = document.createElement('span');

  spanToast.classList.add('spanMensagem');

  if (tipo === 'sucesso') {
    mensagemToast.classList.add('toast', 'toast-sucesso');
    iconeNotificacoes.classList.add(
      'fa-solid',
      'icon-check',
      'fa-circle-check',
    );
  } else if (tipo === 'removido') {
    mensagemToast.classList.add('toast', 'toast-removido');
    iconeNotificacoes.classList.add('fa-solid', 'icon-remove', 'fa-trash');
  } else if (tipo === 'aviso') {
    mensagemToast.classList.add('toast', 'toast-aviso');
    iconeNotificacoes.classList.add(
      'fa-solid',
      'icon-aviso',
      'fa-triangle-exclamation',
    );
  }

  spanToast.textContent = mensagem;

  mensagemToast.appendChild(iconeNotificacoes);
  mensagemToast.appendChild(spanToast);

  document.body.appendChild(mensagemToast);

  setTimeout(() => {
    mensagemToast.remove();
  }, 3000);
}

function filtrarPorTipo(tipo) {
  const resultado = movimentacoes.filter((movimentacaoTipo) => {
    return movimentacaoTipo.tipo === tipo;
  });

  return resultado;
}

//Splice - Serve para remover um elemento de um array, a partir do índice informado e a quantidade de elementos a serem removidos. No caso, estamos removendo apenas 1 elemento, que é o elemento clicado na lista de movimentações.
listMovement.addEventListener('click', (event) => {
  if (event.target.classList.contains('icon-trash')) {
    // Verifica se o elemento clicado é o ícone de lixeira
    const index = Number(event.target.parentElement.dataset.index); // Obtém o índice da movimentação a ser removida
    movimentacoes.splice(index, 1); // Remove a movimentação do array

    mostrarToast('Item foi removido com sucesso!', 'removido');

    salvarNoLocalStorage(); // Atualiza o localStorage após a remoção

    renderizarMovimentacoes(); // Re-renderiza a lista de movimentações
    atualizarResumo(); // Atualiza o resumo após a remoção
  } else if (event.target.classList.contains('icon-edit')) {
    const index = Number(event.target.parentElement.dataset.index); // Obtém o índice da movimentação a ser editada

    const movimentacao = movimentacoes[index]; //está pegando a movimentação que foi clicada para edição, através do índice obtido do dataset do elemento pai (li)

    // Preenche o formulário com os dados da movimentação a ser editada
    /* description.value = movimentacao.descricao;
    value.value = movimentacao.valor;
    movementType.value = movimentacao.tipo;
    selectCategory.value = movimentacao.categoria;

    indiceEdicao = index; // Armazena o índice da movimentação em edição

    console.log('Índice da movimentação em edição:', indiceEdicao); */

    ativarModoEdicao(movimentacao, index);
  }
});

carregarDoLocalStorage(); // Carrega os lançamentos do localStorage ao iniciar a aplicação
renderizarMovimentacoes(); // Renderiza a lista de movimentações com os dados recuperados
atualizarResumo(); // Atualiza o resumo com os dados recuperados

console.log(movimentacoes);

const entradas = filtrarPorTipo('entry');
console.log('Entradas', entradas);

const saidas = filtrarPorTipo('output');
console.log('Saidas', saidas);
