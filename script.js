
// CONTROLE DO HEADER
const header = document.getElementById("mainHeader");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (lastScrollY < window.scrollY && window.scrollY > 100) {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }
  lastScrollY = window.scrollY;
});

// Variável global para armazenar os dados
let allData = [];

// Função para obter todas as semanas de 2025 (domingo a domingo)
function getWeeksOf2025() {
  const weeks = [];
  let currentDate = new Date(2024, 11, 28); // Primeiro domingo de 2025 (28/12/2024)

  while (currentDate.getFullYear() <= 2025) {
    if (
      currentDate.getFullYear() === 2025 ||
      (currentDate.getFullYear() === 2024 && currentDate.getMonth() === 11)
    ) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Formatar datas no formato brasileiro
      const formatDate = (date) => {
        return date.toLocaleDateString("pt-BR");
      };

      weeks.push({
        number: weeks.length + 1,
        start: weekStart,
        end: weekEnd,
        label: `Semana ${weeks.length + 1} (${formatDate(
          weekStart
        )} a ${formatDate(weekEnd)})`,
      });
    }

    // Próximo domingo
    currentDate.setDate(currentDate.getDate() + 7);

    // Parar após a última semana de 2025
    if (
      currentDate.getFullYear() === 2026 &&
      currentDate.getMonth() === 0 &&
      currentDate.getDate() > 4
    ) {
      break;
    }
  }

  return weeks;
}

// Função para obter a semana do ano de uma data
function getWeekOfYear(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Função para carregar dados do arquivo JSON
function loadData() {
  const loadingIndicator = document.getElementById("loadingIndicator");

  // Carregar o arquivo bd.json que está no mesmo diretório
  fetch("/dados/bd.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Arquivo bd.json não encontrado. Usando dados de exemplo."
        );
      }
      return response.json();
    })
    .then((data) => {
      // Filtrar itens vazios ou com valores em branco
      allData = data.filter(
        (item) =>
          item.A &&
          item.A.trim() !== "" &&
          item.B &&
          item.B.trim() !== "" &&
          item.D &&
          item.D.trim() !== "" &&
          item.J &&
          item.J.trim() !== ""
      );
      populateFilters(allData);
      processData();
    })
    .catch((error) => {
      console.error("Erro ao carregar dados:", error);
      // Usar dados de exemplo como fallback
      allData = sampleData;
      populateFilters(allData);
      processData();
    });
}

// Popular os filtros com os dados
function populateFilters(data) {
  const placaFilter = document.getElementById("placaFilter");
  const monthFilter = document.getElementById("monthFilter");
  const weekFilter = document.getElementById("weekFilter");
  const manutencaoFilter = document.getElementById("manutencaoFilter");

  // Limpar e popular filtro de placas
  if (placaFilter) {
    placaFilter.innerHTML = '<option value="all">Todas as placas</option>';
    const placas = new Set();

    data.forEach((item) => {
      if (item.D && item.D.trim() !== "") placas.add(item.D);
    });

    placas.forEach((placa) => {
      const option = document.createElement("option");
      option.value = placa;
      option.textContent = placa;
      placaFilter.appendChild(option);
    });
  }

  // Configurar filtro de meses
  if (monthFilter) {
    monthFilter.innerHTML = '<option value="all">Todos os meses</option>';
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    meses.forEach((mes, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = mes;
      monthFilter.appendChild(option);
    });
  }

  // Configurar filtro de semanas de 2025
  if (weekFilter) {
    weekFilter.innerHTML = '<option value="all">Todas as semanas</option>';
    const weeks2025 = getWeeksOf2025();
    const semanasComDados = new Set();

    // Encontrar semanas que têm dados
    data.forEach((item) => {
      const dataObj = parseDate(item.B || "");
      if (dataObj) {
        const semana = getWeekOfYear(dataObj);
        semanasComDados.add(semana);
      }
    });

    weeks2025.forEach((week) => {
      if (semanasComDados.has(week.number)) {
        const option = document.createElement("option");
        option.value = week.number;
        option.textContent = week.label;
        weekFilter.appendChild(option);
      }
    });
  }

  // Configurar filtro de tipos de manutenção
  if (manutencaoFilter) {
    manutencaoFilter.innerHTML =
      '<option value="all">Todos os tipos</option>';
    const manutencoes = new Set();

    data.forEach((item) => {
      if (item.F && item.F.trim() !== "") manutencoes.add(item.F);
    });

    manutencoes.forEach((manutencao) => {
      const option = document.createElement("option");
      option.value = manutencao;
      option.textContent = manutencao;
      manutencaoFilter.appendChild(option);
    });
  }
}

// Converter data do formato brasileiro para objeto Date
function parseDate(dateString) {
  if (!dateString) return null;
  const parts = dateString.split("/");
  if (parts.length !== 3) return null;
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

// Formatar valor monetário
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

// Função para obter dados filtrados com base nos filtros atuais
function getFilteredData() {
  const mesFiltro = document.getElementById("monthFilter")?.value || "all";
  const semanaFiltro = document.getElementById("weekFilter")?.value || "all";
  const placaFiltro = document.getElementById("placaFilter")?.value || "all";
  const manutencaoFiltro =
    document.getElementById("manutencaoFilter")?.value || "all";

  return allData.filter((item) => {
    // Extrair valores
    const placa = item.D || "";
    const dataEmissao = item.B || "";
    const manutencao = item.F || "";

    // Aplicar filtro de placa
    if (placaFiltro !== "all" && placa !== placaFiltro) return false;

    // Aplicar filtro de manutenção
    if (manutencaoFiltro !== "all" && manutencao !== manutencaoFiltro)
      return false;

    const dataObj = parseDate(dataEmissao);
    if (dataObj) {
      // Filtrar por mês
      if (mesFiltro !== "all" && dataObj.getMonth() != mesFiltro)
        return false;

      // Filtrar por semana do ano
      if (semanaFiltro !== "all") {
        const semana = getWeekOfYear(dataObj);
        if (semana != semanaFiltro) return false;
      }
    } else {
      // Se não conseguir parsear a data, pular item se há filtro de semana
      if (semanaFiltro !== "all") return false;
    }

    return true;
  });
}

// Atualizar os filtros com base nos dados disponíveis
function updateFilterOptions() {
  const filteredData = getFilteredData();
  const placaFilter = document.getElementById("placaFilter");
  const weekFilter = document.getElementById("weekFilter");
  const monthFilter = document.getElementById("monthFilter");
  const manutencaoFilter = document.getElementById("manutencaoFilter");

  const mesSelecionado = monthFilter?.value || "all";
  const semanaSelecionada = weekFilter?.value || "all";
  const placaSelecionada = placaFilter?.value || "all";
  const manutencaoSelecionada = manutencaoFilter?.value || "all";

  // Atualizar filtro de placas
  if (placaFilter) {
    const placas = new Set();

    filteredData.forEach((item) => {
      if (item.D && item.D.trim() !== "") placas.add(item.D);
    });

    placaFilter.innerHTML = '<option value="all">Todas as placas</option>';
    placas.forEach((placa) => {
      const option = document.createElement("option");
      option.value = placa;
      option.textContent = placa;
      placaFilter.appendChild(option);
    });

    // Manter a seleção anterior se ainda estiver disponível
    if (placaSelecionada !== "all" && placas.has(placaSelecionada)) {
      placaFilter.value = placaSelecionada;
    }
  }

  // Atualizar filtro de semanas
  if (weekFilter) {
    const semanas = new Set();

    filteredData.forEach((item) => {
      const dataObj = parseDate(item.B || "");
      if (dataObj) {
        const semana = getWeekOfYear(dataObj);
        semanas.add(semana);
      }
    });

    weekFilter.innerHTML = '<option value="all">Todas as semanas</option>';

    // Obter todas as semanas de 2025 para referência
    const todasSemanas = getWeeksOf2025();

    // Adicionar apenas as semanas que existem nos dados filtrados
    todasSemanas.forEach((week) => {
      if (semanas.has(week.number)) {
        const option = document.createElement("option");
        option.value = week.number;
        option.textContent = week.label;
        weekFilter.appendChild(option);
      }
    });

    // Manter a seleção anterior se ainda estiver disponível
    if (
      semanaSelecionada !== "all" &&
      semanas.has(parseInt(semanaSelecionada))
    ) {
      weekFilter.value = semanaSelecionada;
    }
  }

  // Atualizar filtro de manutenções
  if (manutencaoFilter) {
    const manutencoes = new Set();

    filteredData.forEach((item) => {
      if (item.F && item.F.trim() !== "") manutencoes.add(item.F);
    });

    manutencaoFilter.innerHTML =
      '<option value="all">Todos os tipos</option>';
    manutencoes.forEach((manutencao) => {
      const option = document.createElement("option");
      option.value = manutencao;
      option.textContent = manutencao;
      manutencaoFilter.appendChild(option);
    });

    // Manter a seleção anterior se ainda estiver disponível
    if (
      manutencaoSelecionada !== "all" &&
      manutencoes.has(manutencaoSelecionada)
    ) {
      manutencaoFilter.value = manutencaoSelecionada;
    }
  }
}
// Função para rolar até uma seção específica
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
// Processar dados e preencher a tabela
function processData() {
  const tableBody = document.getElementById("tableBody");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const dataTable = document.getElementById("dataTable");

  // Esconder indicador de carregamento e mostrar tabela
  if (loadingIndicator) loadingIndicator.style.display = "none";
  if (dataTable) dataTable.style.display = "table";

  // Limpar tabela
  if (tableBody) tableBody.innerHTML = "";

  // Obter dados filtrados
  const filteredData = getFilteredData();

  // Processar cada item
  let total = 0;
  let highest = 0;
  let vehicles = new Set();

  filteredData.forEach((item) => {
    // Extrair e formatar valores
    const fornecedor = item.A || "";
    const dataEmissao = item.B || "";
    const mes = item.C || "";
    const placa = item.D || "";
    const manutencao = item.F || "";
    const prazoPagamento = item.H || "";
    const precoTexto = item.J || "R$ 0,00";
    const preco = parseFloat(
      precoTexto.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
    );
    const descricao = item.L || "";

    // Adicionar à tabela
    if (tableBody) {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${fornecedor}</td>
                  <td>${dataEmissao}</td>
                  <td>${placa}</td>
                  <td>${manutencao}</td>
                  <td>${prazoPagamento}</td>
                  <td>${formatCurrency(preco)}</td>
                  <td>${descricao}</td>
              `;
      tableBody.appendChild(row);
    }

    // Atualizar totais
    total += preco;
    if (preco > highest) highest = preco;
    if (placa) vehicles.add(placa);
  });

  // Atualizar resumo
  const totalElement = document.getElementById("totalSpent");
  const highestElement = document.getElementById("highestExpense");
  const averageElement = document.getElementById("averagePerVehicle");

  if (totalElement) totalElement.textContent = formatCurrency(total);
  if (highestElement) highestElement.textContent = formatCurrency(highest);
  if (averageElement) {
    const average = vehicles.size > 0 ? total / vehicles.size : 0;
    averageElement.textContent = formatCurrency(average);
  }
}

// Função para alternar a visualização da tabela (recolher/expandir)
function setupTableToggle() {
  const toggleBtn = document.getElementById("toggleTableBtn");
  const tableContainer = document.getElementById("tableContainer");
  const toggleIcon = document.getElementById("toggleIcon");
  let isCollapsed = false;

  toggleBtn.addEventListener("click", function () {
    isCollapsed = !isCollapsed;

    if (isCollapsed) {
      tableContainer.classList.add("table-collapsed");
      toggleIcon.classList.remove("fa-chevron-down");
      toggleIcon.classList.add("fa-chevron-up");
      toggleBtn.title = "Expandir Tabela";
    } else {
      tableContainer.classList.remove("table-collapsed");
      toggleIcon.classList.remove("fa-chevron-up");
      toggleIcon.classList.add("fa-chevron-down");
      toggleBtn.title = "Recolher Tabela";
    }
  });
}

// Filtros
function setupFilters() {
  const monthFilter = document.getElementById("monthFilter");
  const weekFilter = document.getElementById("weekFilter");
  const placaFilter = document.getElementById("placaFilter");
  const manutencaoFilter = document.getElementById("manutencaoFilter");

  if (monthFilter) monthFilter.addEventListener("change", updateFilters);
  if (weekFilter) weekFilter.addEventListener("change", updateFilters);
  if (placaFilter) placaFilter.addEventListener("change", updateFilters);
  if (manutencaoFilter)
    manutencaoFilter.addEventListener("change", updateFilters);
}

function updateFilters() {
  // Mostrar indicador de carregamento
  const loadingIndicator = document.getElementById("loadingIndicator");
  const dataTable = document.getElementById("dataTable");

  if (loadingIndicator) loadingIndicator.style.display = "block";
  if (dataTable) dataTable.style.display = "none";

  // Atualizar opções dos filtros
  updateFilterOptions();

  // Processar dados com filtros aplicados
  setTimeout(() => {
    processData();
  }, 300);
}

// Inicializar a página
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupFilters();
  setupTableToggle();
});

// ====== CONFIGURAÇÃO DO RELATÓRIO FOTOGRÁFICO ======

// Variáveis globais
window.fotosVeiculos = [];

// Mapeamento de meses para valores numéricos
const mesesMap = {
  janeiro: 0,
  fevereiro: 1,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

// Função para converter nome do mês para número
function mesParaNumero(mes) {
  return mesesMap[mes.toLowerCase()] !== undefined
    ? mesesMap[mes.toLowerCase()]
    : -1;
}

// Função para converter número para nome do mês
function numeroParaMes(numero) {
  return (
    Object.keys(mesesMap).find((key) => mesesMap[key] === parseInt(numero)) ||
    ""
  );
}

// Função para converter link do Google Drive
function converterLinkGoogleDrive(link) {
  if (!link) return "";
  if (link.includes("thumbnail")) return link;

  const match = link.match(/\/file\/d\/([^\/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return link;
}

// Função para carregar fotos
function carregarFotosVeiculos() {
  fetch("/dados/fotos.json")
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao carregar fotos.json");
      return response.json();
    })
    .then((data) => {
      console.log("Dados carregados:", data);
      processarFotosVeiculos(data);
    })
    .catch((error) => {
      console.error("Erro:", error);
      processarFotosVeiculos(dadosExemploFotos);
    });
}

// Processar dados das fotos
function processarFotosVeiculos(dados) {
  if (!dados || dados.length === 0) {
    mostrarMensagemErro("Nenhum dado disponível");
    return;
  }

  window.fotosVeiculos = dados.map((item) => ({
    placa: item.PLACA,
    frota: item.FROTA || "PESADA",
    mes: item.MES.toLowerCase(),
    mesNumero: mesParaNumero(item.MES),
    semana: parseInt(item.SEMANA),
    fotos: [
      {
        nome: "frente / traseira",
        caminho: item["FOTO FRENTE"],
        descricao: "Frente / Traseira - " + item.PLACA,
      },
      {
        nome: "lateral_direita",
        caminho: item["FOTO LATERAL D"],
        descricao: "Lateral Direita - " + item.PLACA,
      },
      {
        nome: "lateral_esquerda",
        caminho: item["FOTO LATERAL E"],
        descricao: "Lateral Esquerda - " + item.PLACA,
      },
      {
        nome: "interior",
        caminho: item["FOTO INTERIOR"],
        descricao: "Interior - " + item.PLACA,
      },
    ],
  }));

  console.log("Dados processados:", window.fotosVeiculos);
  popularFiltrosFotos();
  carregarRelatorioFotografico();
}

// Popular filtros
function popularFiltrosFotos() {
  const mesFilter = document.getElementById("fotoMonthFilter");
  const semanaFilter = document.getElementById("fotoWeekFilter");
  const frotaFilter = document.getElementById("fotoFrotaFilter");

  if (!mesFilter || !semanaFilter || !frotaFilter) {
    console.error("Filtros não encontrados");
    return;
  }

  // Limpar e popular filtros
  frotaFilter.innerHTML = '<option value="all">Todas as frotas</option>';
  semanaFilter.innerHTML = '<option value="all">Todas as semanas</option>';

  // Popular opções de frota (fixas)
  frotaFilter.innerHTML += `
    <option value="LEVE">Leve</option>
    <option value="PESADA">Pesada</option>
  `;

  // Popular semanas
  const semanas = [...new Set(window.fotosVeiculos.map((v) => v.semana))];
  semanas
    .sort((a, b) => a - b)
    .forEach((semana) => {
      semanaFilter.innerHTML += `<option value="${semana}">Semana ${semana}</option>`;
    });

  // Definir valores padrão
  mesFilter.value = "8"; // Setembro é o mês 8 (0-indexed)
  frotaFilter.value = "Todas as frotas"; // Valor padrão para frota
  if (semanas.includes(1)) {
    semanaFilter.value = "3";
  }

  console.log("Filtros populados:", {
    mes: mesFilter.value,
    semana: semanaFilter.value,
    frota: frotaFilter.value,
  });
}

// Função para visualização ampliada
function abrirVisualizacaoAmpliada(src, alt) {
  // Criar modal
  const modal = document.createElement("div");
  modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.95); display: flex; justify-content: center; 
      align-items: center; z-index: 10000; cursor: pointer;
  `;

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.style.cssText = `
      max-width: 90%; max-height: 90%; object-fit: contain;
      border-radius: 8px; box-shadow: 0 5px 25px rgba(0,0,0,0.5);
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  closeBtn.style.cssText = `
      position: absolute; top: 20px; right: 20px; background: #e74c3c;
      color: white; border: none; border-radius: 50%; width: 40px;
      height: 40px; font-size: 24px; cursor: pointer; z-index: 10001;
  `;

  const fechar = () => document.body.removeChild(modal);
  closeBtn.onclick = fechar;
  modal.onclick = (e) => e.target === modal && fechar();

  modal.appendChild(img);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);
}
// Função para rolar até uma seção específica
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
// Dados de exemplo com informações de oficina
/************************************************ INICIO RELATORIO STATUS ***********************************************/
// Função para calcular dias na oficina
function calcularDiasOficina(dataEntrada) {
  if (!dataEntrada) return 0;

  const entrada = new Date(dataEntrada);
  const hoje = new Date();
  const diffTime = Math.abs(hoje - entrada);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Função para carregar dados do status.json
async function carregarDadosFrota() {
  try {
    const response = await fetch("/dados/status.json");
    const data = await response.json();
    exibirDadosFrota(data);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    document.getElementById("frota-table-body").innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; color: #e74c3c; padding: 20px;">
                            <i class="fas fa-exclamation-triangle"></i> Erro ao carregar os dados da frota.
                        </td>
                    </tr>
                `;
  }
}

// Função para exibir os dados na tabela
function exibirDadosFrota(data) {
  const tableBody = document.getElementById("frota-table-body");
  tableBody.innerHTML = "";

  data.forEach((veiculo, index) => {
    // Determinar a classe de status
    let statusClass = "";
    let statusText = "";

    if (veiculo.STATUS.includes("OPERAÇÃO")) {
      statusClass = "status-operacao";
      statusText = "EM OPERAÇÃO";
    } else if (veiculo.STATUS.includes("OCIOSO")) {
      statusClass = "status-ocioso";
      statusText = "OCIOSO";
    } else if (veiculo.STATUS.includes("OFICINA")) {
      statusClass = "status-oficina";
      statusText = "NA OFICINA";
    } else {
      statusClass = "status-ocioso";
      statusText = veiculo.STATUS;
    }

    // Criar linha principal
    const row = document.createElement("tr");
    row.classList.add("veiculo-row");
    row.dataset.index = index;

    row.innerHTML = `
                    <td class="status-text">
                        <span class="status-indicator ${statusClass}"></span>
                        ${statusText}
                    </td>
                    <td>${veiculo.PLACA}</td>
                    <td>${veiculo.FUNCAO}</td>
                    <td>${veiculo.MOTORISTA}</td>
                    <td>${veiculo.ENCARREGADO}</td>
                    <td>${veiculo.SUPERVISOR}</td>
                    <td>${veiculo.LOCAL}</td>
                    
                `;

    tableBody.appendChild(row);

    // Adicionar linha de detalhes para veículos na oficina
    if (veiculo.STATUS.includes("OFICINA")) {
      const diasOficina =
        veiculo.DIAS_OFICINA || calcularDiasOficina(veiculo.DATA_ENTRADA);

      const detailsRow = document.createElement("tr");
      detailsRow.classList.add("oficina-details");
      detailsRow.dataset.parentIndex = index;

      detailsRow.innerHTML = `
                        <td colspan="7">
                            <div class="details-content">
                                <div class="detail-item">
                                    <h4>Descrição do Problema</h4>
                                    <p>${veiculo.DESCRICAO ||
        "Sem descrição detalhada"
        }</p>
                                </div>
                                <div class="detail-item">
                                    <h4>Tempo na Oficina</h4>
                                    <p>Veículo está na oficina há <span class="dias-count">${diasOficina} dias</span></p>
                                    ${veiculo.DATA_ENTRADA
          ? `<p>Desde: ${new Date(
            veiculo.DATA_ENTRADA
          ).toLocaleDateString("pt-BR")}</p>`
          : ""
        }
                                </div>
                                
                            </div>
                        </td>
                    `;

      tableBody.appendChild(detailsRow);
    }
  });

  // Adicionar event listeners para as linhas
  document.querySelectorAll(".veiculo-row").forEach((row) => {
    row.addEventListener("click", function () {
      const index = this.dataset.index;
      const detailsRow = document.querySelector(
        `.oficina-details[data-parent-index="${index}"]`
      );

      if (detailsRow) {
        // Fechar outros detalhes abertos
        document
          .querySelectorAll(".oficina-details.active")
          .forEach((detail) => {
            if (detail !== detailsRow) {
              detail.classList.remove("active");
            }
          });

        // Alternar visibilidade dos detalhes
        detailsRow.classList.toggle("active");
      }
    });
  });
}

// Função para filtrar a tabela
function filtrarTabela() {
  const searchText = document
    .getElementById("search-input")
    .value.toLowerCase();
  const statusFilter =
    document.querySelector(".filter-btn.active")?.dataset.status || "all";
  const rows = document.querySelectorAll(".veiculo-row");
  const detailsRows = document.querySelectorAll(".oficina-details");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const statusCell = cells[0].textContent.toLowerCase();
    const placaCell = cells[1].textContent.toLowerCase();
    const motoristaCell = cells[2].textContent.toLowerCase();
    const localCell = cells[5].textContent.toLowerCase();

    let shouldShow = true;

    // Aplicar filtro de status
    if (statusFilter !== "all") {
      if (statusFilter === "operacao" && !statusCell.includes("operação"))
        shouldShow = false;
      if (statusFilter === "ocioso" && !statusCell.includes("ocioso"))
        shouldShow = false;
      if (statusFilter === "oficina" && !statusCell.includes("oficina"))
        shouldShow = false;
    }

    // Aplicar filtro de texto
    if (
      searchText &&
      !(
        placaCell.includes(searchText) ||
        motoristaCell.includes(searchText) ||
        localCell.includes(searchText)
      )
    ) {
      shouldShow = false;
    }

    row.style.display = shouldShow ? "" : "none";

    // Mostrar/ocultar detalhes correspondentes
    const index = row.dataset.index;
    const detailsRow = document.querySelector(
      `.oficina-details[data-parent-index="${index}"]`
    );
    if (detailsRow) {
      detailsRow.style.display = shouldShow ? "" : "none";
      if (!shouldShow) {
        detailsRow.classList.remove("active");
      }
    }
  });
}
/****************************************************** FIM RELATÓRIO STATUS *******************************************/
//******************** SEÇÃO DO RASTREAMENTO ****************** //
// Variáveis globais
let selectedPlaca = null;
let filteredData = [];
let trajetoData = []; // Inicialmente vazio

// Função para converter link do Google Drive
function converterLinkGoogleDrive(link) {
  if (!link) return "";
  if (link.includes("thumbnail")) return link;

  const match = link.match(/\/file\/d\/([^\/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return link;
}

// Função para carregar dados do JSON
function carregarDadosRastreio() {
  // Tenta carregar do arquivo rastreio.json
  fetch("dados/rastreio.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Arquivo rastreio.json não encontrado. Usando dados de exemplo."
        );
      }
      return response.json();
    })
    .then((data) => {
      trajetoData = data;
      init();
    })
    .catch((error) => {
      console.error(error);
      // Se não encontrar o arquivo, usa dados de exemplo
      init();
    });
}

// Função para inicializar a aplicação
function init() {
  // Inicialmente mostrar a mensagem de seleção e esconder os detalhes
  document.getElementById("no-data-selected").style.display = "block";
  document.getElementById("details-content").style.display = "none";

  loadPlacas();
  setupEventListeners();
  setupFilters();
}

// Configurar filtros
function setupFilters() {
  const monthFilter = document.getElementById("month-filter");
  const weekFilter = document.getElementById("week-filter");
  const placaFilter = document.getElementById("placa-filter");
  const maintenanceFilter = document.getElementById("maintenance-filter");
  const typeFilter = document.getElementById("type-filter");

  // Limpar filtros
  monthFilter.innerHTML = '<option value="all">Todos os meses</option>';
  weekFilter.innerHTML = '<option value="all">Todas as semanas</option>';
  placaFilter.innerHTML = '<option value="all">Todas as placas</option>';

  // Extrair meses únicos (coluna O)
  const mesesUnicos = [
    ...new Set(trajetoData.map((item) => item.O || "Mês não informado")),
  ];
  mesesUnicos.forEach((mes) => {
    const option = document.createElement("option");
    option.value = mes;
    option.textContent = mes;
    monthFilter.appendChild(option);
  });

  // Extrair semanas únicas (coluna N)
  const semanasUnicas = [
    ...new Set(trajetoData.map((item) => item.N || "Semana não informada")),
  ];
  semanasUnicas.forEach((semana) => {
    const option = document.createElement("option");
    option.value = semana;
    option.textContent = semana;
    weekFilter.appendChild(option);
  });

  // Extrair placas únicas
  const placasUnicas = [...new Set(trajetoData.map((item) => item.B))];
  placasUnicas.forEach((placa) => {
    const option = document.createElement("option");
    option.value = placa;
    option.textContent = placa;
    placaFilter.appendChild(option);
  });

  // Configurar eventos dos filtros
  monthFilter.addEventListener("change", aplicarFiltros);
  weekFilter.addEventListener("change", aplicarFiltros);
  placaFilter.addEventListener("change", aplicarFiltros);
  maintenanceFilter.addEventListener("change", aplicarFiltros);
  typeFilter.addEventListener("change", aplicarFiltros);
}

// Aplicar filtros
function aplicarFiltros() {
  const monthFilter = document.getElementById("month-filter").value;
  const weekFilter = document.getElementById("week-filter").value;
  const placaFilter = document.getElementById("placa-filter").value;
  const maintenanceFilter = document.getElementById("maintenance-filter").value;
  const typeFilter = document.getElementById("type-filter").value;

  // Filtrar dados com base nos filtros
  let dadosFiltrados = trajetoData;

  if (monthFilter !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.O === monthFilter);
  }

  if (weekFilter !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.N === weekFilter);
  }

  if (placaFilter !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.B === placaFilter);
  }

  if (typeFilter !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.C === typeFilter);
  }

  // Filtrar por manutenção (exemplo simplificado)
  if (maintenanceFilter !== "all") {
    // Esta é uma implementação de exemplo - ajuste conforme seus dados
    if (maintenanceFilter === "com_manutencao") {
      dadosFiltrados = dadosFiltrados.filter((item) => item.H > 15); // Exemplo: mais de 15 paradas
    } else {
      dadosFiltrados = dadosFiltrados.filter((item) => item.H <= 15); // Exemplo: 15 ou menos paradas
    }
  }

  // Extrair placas únicas dos dados filtrados
  const placasFiltradas = [...new Set(dadosFiltrados.map((item) => item.B))];

  // Atualizar lista de placas
  const placasList = document.getElementById("placas-list");
  placasList.innerHTML = "";

  placasFiltradas.forEach((placa) => {
    // Encontrar a data mais recente para esta placa
    const datasPlaca = dadosFiltrados
      .filter((item) => item.B === placa)
      .map((item) => item.A);

    const dataRecente = datasPlaca.sort((a, b) => {
      const [diaA, mesA, anoA] = a.split("/");
      const [diaB, mesB, anoB] = b.split("/");
      return new Date(anoB, mesB - 1, diaB) - new Date(anoA, mesA - 1, diaA);
    })[datasPlaca.length - 1];

    const placaItem = document.createElement("div");
    placaItem.classList.add("placa-item");
    placaItem.dataset.placa = placa;

    placaItem.innerHTML = `
                    <span class="placa-text">${placa}</span>
                    <span class="placa-date">${dataRecente}</span>
                `;

    placaItem.addEventListener("click", () => selectPlaca(placa));
    placasList.appendChild(placaItem);
  });

  // Atualizar contador
  document.getElementById("placas-count").textContent = placasFiltradas.length;

  // Se a placa selecionada não estiver mais na lista filtrada, limpar detalhes
  if (selectedPlaca && !placasFiltradas.includes(selectedPlaca)) {
    document.getElementById("no-data-selected").style.display = "block";
    document.getElementById("details-content").style.display = "none";
    selectedPlaca = null;
  }
}

// Carregar a lista de placas
function loadPlacas() {
  aplicarFiltros(); // Carrega a lista inicial aplicando os filtros padrão
}

// Selecionar uma placa
function selectPlaca(placa) {
  selectedPlaca = placa;

  // Atualizar UI
  document.querySelectorAll(".placa-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.placa === placa) {
      item.classList.add("active");
    }
  });

  // Mostrar detalhes
  document.getElementById("no-data-selected").style.display = "none";
  document.getElementById("details-content").style.display = "block";

  // Carregar dados da placa
  loadPlacaDetails(placa);
}

// Carregar detalhes da placa selecionada
function loadPlacaDetails(placa) {
  const detailDateFilter = document.getElementById("detail-date-filter");
  const placaText = document.getElementById("placa-text");
  const porteText = document.getElementById("porte-text");

  // Filtrar dados por placa
  filteredData = trajetoData.filter((item) => item.B === placa);

  // Aplicar filtros adicionais
  const monthFilter = document.getElementById("month-filter").value;
  const weekFilter = document.getElementById("week-filter").value;

  if (monthFilter !== "all") {
    filteredData = filteredData.filter((item) => item.O === monthFilter);
  }

  if (weekFilter !== "all") {
    filteredData = filteredData.filter((item) => item.N === weekFilter);
  }

  // Atualizar header com placa e porte
  placaText.textContent = placa;

  // Obter o porte (assumindo que é o mesmo para todas as datas)
  if (filteredData.length > 0) {
    porteText.textContent = filteredData[0].C;
  }

  // Popular filtro de datas no painel de detalhes
  detailDateFilter.innerHTML = "";
  const datasPlaca = [...new Set(filteredData.map((item) => item.A))];
  datasPlaca
    .sort((a, b) => {
      const [dayA, monthA, yearA] = a.split("/");
      const [dayB, monthB, yearB] = b.split("/");
      return (
        new Date(`${yearB}-${monthB}-${dayB}`) -
        new Date(`${yearA}-${monthA}-${dayA}`)
      );
    })
    .forEach((data) => {
      const option = document.createElement("option");
      option.value = data;

      // Adicionar dia da semana
      const [dia, mes, ano] = data.split("/");
      const dataObj = new Date(ano, mes - 1, dia);
      const diasSemana = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ];
      const diaSemana = diasSemana[dataObj.getDay()];

      option.textContent = `${diaSemana} - ${data}`;
      detailDateFilter.appendChild(option);
    });

  // Selecionar a data mais recente por padrão
  if (datasPlaca.length > 0) {
    detailDateFilter.value = datasPlaca[datasPlaca.length - 1];
    showDataForDate(datasPlaca[datasPlaca.length - 1]);
  }
}

// Mostrar dados para uma data específica
function showDataForDate(data) {
  const mapImage = document.getElementById("map-image");
  const mapPlaceholder = document.getElementById("map-placeholder");

  // Encontrar os dados para a data selecionada
  const dataItem = filteredData.find((item) => item.A === data);

  if (!dataItem) {
    // Se não encontrar dados, mostrar mensagem
    const detailsGrid = document.querySelector(".details-grid");
    detailsGrid.innerHTML =
      '<div class="no-data"><i class="fas fa-exclamation-circle"></i><p>Nenhum dado encontrado para esta data</p></div>';
    return;
  }

  // Atualizar os detalhes na grid
  const detailsGrid = document.querySelector(".details-grid");
  detailsGrid.innerHTML = `
                <div class="detail-card">
                    <h3>Data</h3>
                    <div class="detail-value">${dataItem.A}</div>
                </div>
                <div class="detail-card">
                    <h3>Distância Percorrida</h3>
                    <div class="detail-value">${dataItem.D} <span class="detail-unit">km</span></div>
                </div>
                <div class="detail-card">
                    <h3>Tempo de Motor Ocioso</h3>
                    <div class="detail-value">${dataItem.F} <span class="detail-unit">min</span></div>
                </div>
                <div class="detail-card">
                    <h3>Porte</h3>
                    <div class="detail-value">${dataItem.C}</div>
                </div>
                <div class="detail-card">
                    <h3>Tempo Total Dirigido</h3>
                    <div class="detail-value">${dataItem.E} <span class="detail-unit">min</span></div>
                </div>
                <div class="detail-card">
                    <h3>Total de Paradas</h3>
                    <div class="detail-value">${dataItem.H} <span class="detail-unit">paradas</span></div>
                </div>
                <div class="detail-card">
                    <h3>Tempo Médio de Cada Parada</h3>
                    <div class="detail-value">${dataItem.J} <span class="detail-unit">min</span></div>
                </div>
                <div class="detail-card">
                    <h3>Tempo Total de Motor Ligado</h3>
                    <div class="detail-value">${dataItem.G} <span class="detail-unit">min</span></div>
                </div>
            `;

  // Carregar imagem do mapa a partir do campo M do JSON
  if (dataItem.M) {
    // Converter link do Google Drive para link de thumbnail
    const convertedLink = converterLinkGoogleDrive(dataItem.M);

    // Mostrar placeholder enquanto a imagem carrega
    mapPlaceholder.style.display = "flex";
    mapImage.style.display = "none";

    // Criar uma nova imagem para verificar se carrega corretamente
    const testImage = new Image();
    testImage.onload = function () {
      // Se carregar com sucesso, mostrar a imagem
      mapImage.src = convertedLink;
      mapImage.style.display = "block";
      mapPlaceholder.style.display = "none";

      // Armazenar o link original para abrir em tela cheia
      mapImage.dataset.original = dataItem.M;
    };
    testImage.onerror = function () {
      // Se der erro, manter o placeholder
      mapPlaceholder.innerHTML =
        '<i class="fas fa-exclamation-triangle"></i><p>Não foi possível carregar o mapa</p>';
    };
    testImage.src = convertedLink;
  } else {
    // Se não houver link de mapa
    mapPlaceholder.innerHTML =
      '<i class="fas fa-map"></i><p>Nenhum mapa disponível</p>';
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Filtro de pesquisa de placas
  document
    .getElementById("search-placas")
    .addEventListener("input", function () {
      const searchText = this.value.toLowerCase();
      document.querySelectorAll(".placa-item").forEach((item) => {
        const placa = item.dataset.placa.toLowerCase();
        if (placa.includes(searchText)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });

  // Filtro de data no painel de detalhes
  document
    .getElementById("detail-date-filter")
    .addEventListener("change", function () {
      showDataForDate(this.value);
    });

  // Botão fechar painel
  document.getElementById("close-panel").addEventListener("click", function () {
    document.getElementById("no-data-selected").style.display = "block";
    document.getElementById("details-content").style.display = "none";
    document.querySelectorAll(".placa-item").forEach((item) => {
      item.classList.remove("active");
    });
    selectedPlaca = null;
  });

  // Abrir imagem em tela cheia
  document.getElementById("map-image").addEventListener("click", function () {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-image");
    const originalLink = this.dataset.original;

    if (originalLink) {
      // Usar o link convertido para visualização
      modalImg.src = converterLinkGoogleDrive(originalLink);
      modal.style.display = "block";
    }
  });

  // Fechar modal
  document.getElementById("close-modal").addEventListener("click", function () {
    document.getElementById("image-modal").style.display = "none";
  });

  // Fechar modal ao clicar fora da imagem
  document
    .getElementById("image-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", carregarDadosRastreio);
//*********************************** FIM DA SEÇÃO DO RASTREAMENTO *****************************************//    

//*********************************** INICIO SEÇÃO RELATÓRIO FOTOGRÁFICO  *********************************/
// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  carregarDadosFrota();

  // Configurar eventos de filtro
  document
    .getElementById("search-input")
    .addEventListener("input", filtrarTabela);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      filtrarTabela();
    });
  });

  // Ativar o filtro "Todos" por padrão
  document.querySelector('[data-status="all"]').classList.add("active");
});
// Carregar relatório fotográfico
function carregarRelatorioFotografico() {
  const mesFiltro =
    document.getElementById("fotoMonthFilter")?.value || "all";
  const semanaFiltro =
    document.getElementById("fotoWeekFilter")?.value || "all";
  const frotaFiltro =
    document.getElementById("fotoFrotaFilter")?.value || "all";

  console.log("Filtrando por:", {
    mes: mesFiltro,
    semana: semanaFiltro,
    frota: frotaFiltro,
  });

  const galeria = document.getElementById("galeriaVeiculos");
  if (!galeria) return;

  galeria.innerHTML = "";

  const veiculosFiltrados = window.fotosVeiculos.filter((veiculo) => {
    // Filtro por mês (comparando números)
    if (mesFiltro !== "all" && veiculo.mesNumero != mesFiltro) {
      console.log("Filtrando mês:", veiculo.mesNumero, "!=", mesFiltro);
      return false;
    }

    // Filtro por semana
    if (semanaFiltro !== "all" && veiculo.semana != semanaFiltro) {
      console.log("Filtrando semana:", veiculo.semana, "!=", semanaFiltro);
      return false;
    }

    // Filtro por frota
    if (frotaFiltro !== "all" && veiculo.frota !== frotaFiltro) {
      console.log("Filtrando frota:", veiculo.frota, "!=", frotaFiltro);
      return false;
    }

    return true;
  });

  console.log("Veículos filtrados:", veiculosFiltrados.length);

  if (veiculosFiltrados.length === 0) {
    galeria.innerHTML =
      '<div class="sem-fotos">Nenhum veículo encontrado</div>';
    return;
  }

  veiculosFiltrados.forEach((veiculo) => {
    const veiculoHTML = `
          <div class="veiculo-item">
              <div class="veiculo-placa">${veiculo.placa} - Semana ${veiculo.semana
      }</div>
              <div class="veiculo-fotos">
                  ${veiculo.fotos
        .map((foto) => {
          const linkConvertido = converterLinkGoogleDrive(
            foto.caminho
          );
          return `
                          <div class="foto-container" onclick="abrirVisualizacaoAmpliada('${linkConvertido}', '${foto.descricao
            }')">
                              <img src="${linkConvertido}" alt="${foto.descricao
            }" class="veiculo-foto"
                                   onerror="this.src='https://images.unsplash.com/photo-1549399542-7e82138d43a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                              <div class="foto-legenda">${foto.nome.replace(
              /_/g,
              " "
            )}</div>
                              <div class="foto-zoom-icon"><i class="fas fa-search-plus"></i></div>
                          </div>
                      `;
        })
        .join("")}
              </div>
          </div>
      `;
    galeria.innerHTML += veiculoHTML;
  });
}

function mostrarMensagemErro(msg) {
  const galeria = document.getElementById("galeriaVeiculos");
  if (galeria) galeria.innerHTML = `<div class="sem-fotos">${msg}</div>`;
}

// Configurar eventos
function configurarFiltrosFotos() {
  const monthFilter = document.getElementById("fotoMonthFilter");
  const weekFilter = document.getElementById("fotoWeekFilter");
  const frotaFilter = document.getElementById("fotoFrotaFilter");

  if (monthFilter)
    monthFilter.addEventListener("change", carregarRelatorioFotografico);
  if (weekFilter)
    weekFilter.addEventListener("change", carregarRelatorioFotografico);
  if (frotaFilter)
    frotaFilter.addEventListener("change", carregarRelatorioFotografico);
}

// Adicionar estilos
const addStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
      .foto-container {
          position: relative; overflow: hidden; border-radius: 4px; 
          cursor: pointer; transition: transform 0.2s;
      }
      .foto-container:hover { transform: scale(1.02); }
      .veiculo-foto { 
          width: 100%; height: 120px; object-fit: cover; 
      }
      .foto-legenda {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(0,0,0,0.7); color: white; padding: 4px;
          font-size: 0.8rem; text-align: center; text-transform: capitalize;
      }
      .foto-zoom-icon {
          position: absolute; top: 5px; right: 5px;
          background: rgba(0,0,0,0.7); color: white; width: 24px;
          height: 24px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; opacity: 0;
          transition: opacity 0.3s; pointer-events: none;
      }
      .foto-container:hover .foto-zoom-icon { opacity: 1; }
      .foto-zoom-icon i { font-size: 12px; }
      .veiculo-fotos {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 10px; padding: 12px;
      }
      .sem-fotos {
          grid-column: 1 / -1; text-align: center; padding: 20px;
          color: #7f8c8d; font-style: italic;
      }
  `;
  document.head.appendChild(style);
};

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  addStyles();
  configurarFiltrosFotos();
  carregarFotosVeiculos();

  // Tornar funções globais
  window.abrirVisualizacaoAmpliada = abrirVisualizacaoAmpliada;
  window.carregarRelatorioFotografico = carregarRelatorioFotografico;
});
/***************************************** FIM DO RELATÓRIO FOTOGRÁFICO **********************************************/
// *************************************** INICIO DO RELATÓRIO DE MANUTENÇÃO *************************************  //

// Variáveis globais
window.manutencaoData = [];

// Função para carregar dados de manutenção
function carregarManutencaoData() {
  fetch("/dados/manutencao.json")
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao carregar manutencao.json");
      return response.json();
    })
    .then((data) => {
      console.log("Dados de manutenção carregados:", data);
      processarManutencaoData(data);
    })
    .catch((error) => {
      console.error("Erro:", error);
      processarManutencaoData(dadosExemploManutencao);
    });
}

// Processar dados de manutenção
function processarManutencaoData(dados) {
  if (!dados || dados.length === 0) {
    mostrarMensagemErroManutencao("Nenhum dado de manutenção disponível");
    return;
  }

  window.manutencaoData = dados.map((item) => {
    // Verificar e corrigir possíveis variações nas chaves
    const descricao =
      item.DESCRICAO ||
      item.DESCRIÇÃO ||
      item.descricao ||
      "Descrição não disponível";
    const custo = item.CUSTO || item.custo || 0;

    return {
      placa: item.PLACA,
      mes: item.MES.toLowerCase(),
      mesNumero: mesParaNumero(item.MES),
      semana: parseInt(item.SEMANA),
      tipo: item.MANUTENÇÃO || item.MANUTENCAO,
      descricao: descricao,
      custo: parseFloat(custo) || 0,
      fotos: [
        {
          nome: "frente / traseira",
          caminho: item["FOTO FRENTE"],
          descricao: "Frente / Traseira - " + item.PLACA,
        },
        {
          nome: "Foto avaria",
          caminho: item["FOTO AVARIA"],
          descricao: "Foto Avaria - " + item.PLACA,
        },
        {
          nome: "Foto manutenção",
          caminho: item["FOTO MANUTENCAO"],
          descricao: "Foto avaria  - " + item.PLACA,
        },
        {
          nome: "Quilometragem",
          caminho: item["FOTO KM"],
          descricao: "Quilometragem da avaria - " + item.PLACA,
        },
      ],
    };
  });

  console.log("Dados processados:", window.manutencaoData);
  popularFiltrosManutencao();
  carregarRelatorioManutencao();
}

// Popular filtros de manutenção
function popularFiltrosManutencao() {
  const mesFilter = document.getElementById("manutencaoMonthFilter");
  const semanaFilter = document.getElementById("manutencaoWeekFilter");
  const placaFilter = document.getElementById("manutencaoPlacaFilter");
  const tipoFilter = document.getElementById("manutencaoTipoFilter");

  if (!mesFilter || !semanaFilter || !placaFilter || !tipoFilter) return;

  // Limpar filtros
  placaFilter.innerHTML = '<option value="all">Todas as placas</option>';
  semanaFilter.innerHTML = '<option value="all">Todas as semanas</option>';
  tipoFilter.innerHTML = '<option value="all">Todos os tipos</option>';

  // Popular placas
  const placas = [...new Set(window.manutencaoData.map((v) => v.placa))];
  placas.forEach((placa) => {
    placaFilter.innerHTML += `<option value="${placa}">${placa}</option>`;
  });

  // Popular semanas
  const semanas = [...new Set(window.manutencaoData.map((v) => v.semana))];
  semanas
    .sort((a, b) => a - b)
    .forEach((semana) => {
      semanaFilter.innerHTML += `<option value="${semana}">Semana ${semana}</option>`;
    });

  // Popular tipos de manutenção
  const tipos = [...new Set(window.manutencaoData.map((v) => v.tipo))];
  tipos.forEach((tipo) => {
    tipoFilter.innerHTML += `<option value="${tipo}">${tipo}</option>`;
  });

  // Definir valores padrão
  mesFilter.value = "8"; // Setembro

  // ALTERAÇÃO AQUI: Priorizar semana 3, se disponível
  if (semanas.includes(3)) {
    semanaFilter.value = "3";
  } else if (semanas.length > 0) {
    // Se semana 3 não estiver disponível, usar a primeira semana disponível
    semanaFilter.value = semanas[0].toString();
  }
}

// Carregar relatório de manutenção
function carregarRelatorioManutencao() {
  const mesFiltro =
    document.getElementById("manutencaoMonthFilter")?.value || "all";
  const semanaFiltro =
    document.getElementById("manutencaoWeekFilter")?.value || "all";
  const placaFiltro =
    document.getElementById("manutencaoPlacaFilter")?.value || "all";
  const tipoFiltro =
    document.getElementById("manutencaoTipoFilter")?.value || "all";

  const galeria = document.getElementById("galeriaManutencao");
  if (!galeria) return;

  galeria.innerHTML = "";

  const itensFiltrados = window.manutencaoData.filter((item) => {
    if (mesFiltro !== "all" && item.mesNumero != mesFiltro) return false;
    if (semanaFiltro !== "all" && item.semana != semanaFiltro) return false;
    if (placaFiltro !== "all" && item.placa !== placaFiltro) return false;
    if (tipoFiltro !== "all" && item.tipo !== tipoFiltro) return false;
    return true;
  });

  if (itensFiltrados.length === 0) {
    galeria.innerHTML =
      '<div class="sem-fotos">Nenhuma manutenção encontrada</div>';
    return;
  }

  itensFiltrados.forEach((item) => {
    const itemHTML = `
          <div class="manutencao-item">
              <div class="manutencao-header">
                  <div class="manutencao-placa">${item.placa} - Semana ${item.semana
      }</div>
                  <div class="manutencao-tipo">${item.tipo}</div>
              </div>
              
              <div class="manutencao-info">
                  <div class="manutencao-descricao">
                      <strong>Descrição:</strong><br>
                      ${item.descricao}
                  </div>
                  <div class="manutencao-custo">Custo: ${formatCurrency(
        item.custo
      )}</div>
              </div>
              
              <div class="manutencao-fotos">
                  ${item.fotos
        .map((foto) => {
          const linkConvertido = converterLinkGoogleDrive(
            foto.caminho
          );
          return `
                          <div class="foto-container" onclick="abrirVisualizacaoAmpliada('${linkConvertido}', '${foto.descricao
            }')">
                              <img src="${linkConvertido}" alt="${foto.descricao
            }" class="veiculo-foto"
                                   onerror="this.src='https://images.unsplash.com/photo-1549399542-7e82138d43a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                              <div class="foto-legenda">${foto.nome.replace(
              /_/g,
              " "
            )}</div>
                              <div class="foto-zoom-icon"><i class="fas fa-search-plus"></i></div>
                          </div>
                      `;
        })
        .join("")}
              </div>
          </div>
      `;
    galeria.innerHTML += itemHTML;
  });
}

function mostrarMensagemErroManutencao(msg) {
  const galeria = document.getElementById("galeriaManutencao");
  if (galeria) galeria.innerHTML = `<div class="sem-fotos">${msg}</div>`;
}

// Configurar eventos dos filtros de manutenção
function configurarFiltrosManutencao() {
  const monthFilter = document.getElementById("manutencaoMonthFilter");
  const weekFilter = document.getElementById("manutencaoWeekFilter");
  const placaFilter = document.getElementById("manutencaoPlacaFilter");
  const tipoFilter = document.getElementById("manutencaoTipoFilter");

  if (monthFilter)
    monthFilter.addEventListener("change", carregarRelatorioManutencao);
  if (weekFilter)
    weekFilter.addEventListener("change", carregarRelatorioManutencao);
  if (placaFilter)
    placaFilter.addEventListener("change", carregarRelatorioManutencao);
  if (tipoFilter)
    tipoFilter.addEventListener("change", carregarRelatorioManutencao);
}

// Inicializar relatório de manutenção
document.addEventListener("DOMContentLoaded", () => {
  configurarFiltrosManutencao();
  carregarManutencaoData();
  /********************************************* FIM DO RELATÓRIO DE MANUTEÇÃO ******************************************/
});