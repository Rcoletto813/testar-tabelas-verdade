function extrairVariaveis(expressao) {
  const regex = /[A-Za-z]\w*/g;
  const encontrados = expressao.match(regex) || [];

  const palavrasReservadas = new Set(["not", "true", "false"]);
  const variaveis = [
    ...new Set(
      encontrados.filter((v) => !palavrasReservadas.has(v.toLowerCase()))
    ),
  ];

  return variaveis;
}

function gerarCombinacoes(n) {
  const total = 2 ** n;
  const combinacoes = [];

  for (let i = 0; i < total; i++) {
    const bits = [];
    for (let j = n - 1; j >= 0; j--) {
      bits.push(Boolean(i & (1 << j)));
    }
    combinacoes.push(bits);
  }

  return combinacoes;
}

function gerarTabela(expressao) {
  const variaveis = extrairVariaveis(expressao);
  const combos = gerarCombinacoes(variaveis.length);
  const resultados = [];

 combos.forEach((combo) => {
  let expAvaliar = expressao;

  variaveis.forEach((v, idx) => {
    const re = new RegExp("\\b" + v + "\\b", "g");
    expAvaliar = expAvaliar.replace(re, combo[idx] ? "true" : "false");
  });

  expAvaliar = expAvaliar
    .replace(/\*/g, "&&")                  // * -> AND
    .replace(/\+/g, "||")                  // + -> OR
    .replace(/\bnot\s*\(/gi, "!(");        // not(...) -> !(...)

  const valor = eval(expAvaliar);
  resultados.push({ valores: combo, resultado: valor });
});

  return { variaveis, resultados };
}

function avaliarExpressao(expressao, variaveis, combo) {
  let expAvaliar = expressao;

  variaveis.forEach((v, idx) => {
    const re = new RegExp("\\b" + v + "\\b", "g");
    expAvaliar = expAvaliar.replace(re, combo[idx] ? "true" : "false");
  });

  expAvaliar = expAvaliar
    .replace(/\*/g, "&&")
    .replace(/\+/g, "||")
    .replace(/\bnot\s*\(/gi, "!(");

  return eval(expAvaliar);
}

function renderTabela(expressao) {
  const { variaveis, resultados } = gerarTabela(expressao);

  const tabela = document.createElement("table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  variaveis.forEach((v) => {
    const th = document.createElement("th");
    th.textContent = v;
    headerRow.appendChild(th);
  });
  const thSaida = document.createElement("th");
  thSaida.textContent = "Saída";
  headerRow.appendChild(thSaida);
  thead.appendChild(headerRow);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  resultados.forEach((linha) => {
    const tr = document.createElement("tr");
    linha.valores.forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    const tdResultado = document.createElement("td");
    tdResultado.textContent = linha.resultado;
    tr.appendChild(tdResultado);

    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);

  const container = document.getElementById("resultado");
  container.innerHTML = "";
  container.appendChild(tabela);
}

function gerarTabelaComparacao(expUsuario, expGabarito) {
  const varsUsuario = extrairVariaveis(expUsuario);
  const varsGabarito = extrairVariaveis(expGabarito);
  const todasVariaveis = [...new Set([...varsUsuario, ...varsGabarito])];

  const combos = gerarCombinacoes(todasVariaveis.length);

  const resultados = combos.map(combo => {
    const resultadoUsuario = avaliarExpressao(expUsuario, todasVariaveis, combo);
    const resultadoGabarito = avaliarExpressao(expGabarito, todasVariaveis, combo);
    return {
      valores: combo,
      resultadoUsuario,
      resultadoGabarito,
      iguais: resultadoUsuario === resultadoGabarito
    };
  });

  return { todasVariaveis, resultados };
}


function renderTabelaComparacao(expUsuario, expGabarito) {
  const { todasVariaveis, resultados } = gerarTabelaComparacao(expUsuario, expGabarito);

  const container = document.getElementById("resultado");
  container.innerHTML = "";

  const tabela = document.createElement("table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  todasVariaveis.forEach(v => {
    const th = document.createElement("th");
    th.textContent = v;
    headerRow.appendChild(th);
  });
  ["Seu Resultado", "Gabarito", "Iguais?"].forEach(titulo => {
    const th = document.createElement("th");
    th.textContent = titulo;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  tabela.appendChild(thead);

  // Corpo
  const tbody = document.createElement("tbody");
  resultados.forEach(linha => {
    const tr = document.createElement("tr");
    linha.valores.forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    [linha.resultadoUsuario, linha.resultadoGabarito, linha.iguais].forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);
  container.appendChild(tabela);
}

const acao = document.getElementById("acao");
const gabaritoContainer = document.getElementById("gabaritoContainer");

acao.addEventListener("change", () => {
  if (acao.value === "comparar") {
    gabaritoContainer.classList.remove("hidden");
  } else {
    gabaritoContainer.classList.add("hidden");
  }
});

document.getElementById("executar").addEventListener("click", () => {
  const expressao = document.getElementById("expressao").value;
  const tipo = acao.value;
  const gabarito = document.getElementById("gabarito").value;

  if (tipo === "tabela") {
    renderTabela(expressao);
  } else {
    renderTabelaComparacao(expressao, gabarito);
  }
});

const btnAjuda = document.getElementById("btnAjuda");
const modal = document.getElementById("modal");
const fechar = document.getElementById("fechar");

btnAjuda.onclick = () => {
  modal.style.display = "flex";
};

fechar.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
