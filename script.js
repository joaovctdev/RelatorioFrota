
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


/*********************************************  TABELA FINANCEIRO ********************************************************/

let allData = [];


function loadData() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  const dataTable = document.getElementById("dataTable");

  
  if (loadingIndicator) loadingIndicator.style.display = "block";
  if (dataTable) dataTable.style.display = "none";

  
  fetch("dados/bd.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Arquivo bd.json não encontrado.");
      }
      return response.json();
    })
    .then((data) => {
      
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
      
      allData = getSampleData();
      populateFilters(allData);
      processData();
    });
}


function populateFilters(data) {
  const placaFilter = document.getElementById("placaFilter");
  const monthFilter = document.getElementById("monthFilter");
  const manutencaoFilter = document.getElementById("manutencaoFilter");
  const localidadeFilter = document.getElementById("localidadeFilter");

  
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

  
  if (monthFilter) {
    monthFilter.innerHTML = '<option value="all">Todos os meses</option>';
    const meses = [
      {value: 0, nome: "Janeiro"},
      {value: 1, nome: "Fevereiro"},
      {value: 2, nome: "Março"},
      {value: 3, nome: "Abril"},
      {value: 4, nome: "Maio"},
      {value: 5, nome: "Junho"},
      {value: 6, nome: "Julho"},
      {value: 7, nome: "Agosto"},
      {value: 8, nome: "Setembro"},
      {value: 9, nome: "Outubro"},
      {value: 10, nome: "Novembro"},
      {value: 11, nome: "Dezembro"}
    ];

    meses.forEach((mes) => {
      const option = document.createElement("option");
      option.value = mes.value;
      option.textContent = mes.nome;
      monthFilter.appendChild(option);
    });
  }

  
  if (manutencaoFilter) {
    manutencaoFilter.innerHTML = '<option value="all">Todos os tipos</option>';
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

  
  if (localidadeFilter) {
    localidadeFilter.innerHTML = '<option value="all">Todas as filiais</option>';
    const localidades = new Set();

    data.forEach((item) => {
      if (item.M && item.M.trim() !== "") localidades.add(item.M);
    });

    localidades.forEach((localidade) => {
      const option = document.createElement("option");
      option.value = localidade;
      option.textContent = localidade;
      localidadeFilter.appendChild(option);
    });
  }
}


function parseDate(dateString) {
  if (!dateString) return null;
  try {
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    // Validar se a data é válida
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 0 || month > 11) return null;
    if (year < 2000 || year > 2100) return null;
    
    return new Date(year, month, day);
  } catch (error) {
    console.error("Erro ao parsear data:", dateString, error);
    return null;
  }
}

function formatCurrency(value) {
  const numValue = typeof value === 'number' ? value : parseFloat(
    value.toString().replace("R$ ", "").replace(/\./g, "").replace(",", ".")
  );
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(isNaN(numValue) ? 0 : numValue);
}


function getFilteredData() {
  const mesFiltro = document.getElementById("monthFilter")?.value || "all";
  const semanaFiltro = document.getElementById("weekFilter")?.value || "all";
  const placaFiltro = document.getElementById("placaFilter")?.value || "all";
  const manutencaoFiltro = document.getElementById("manutencaoFilter")?.value || "all";
  const localidadeFiltro = document.getElementById("localidadeFilter")?.value || "all";

  return allData.filter((item) => {
    
    const placa = item.D || "";
    const dataEmissao = item.B || "";
    const manutencao = item.F || "";
    const localidade = item.M || ""; 

    
    if (placaFiltro !== "all" && placa !== placaFiltro) return false;

   
    if (manutencaoFiltro !== "all" && manutencao !== manutencaoFiltro) return false;

    
    if (localidadeFiltro !== "all" && localidade !== localidadeFiltro) return false;

    const dataObj = parseDate(dataEmissao);
    
    
    if (mesFiltro !== "all") {
      if (!dataObj) return false; // Se não tem data, não passa no filtro de mês
      if (parseInt(mesFiltro) !== dataObj.getMonth()) return false;
    }

    return true;
  });
}


function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}


function processData() {
  const tableBody = document.getElementById("tableBody");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const dataTable = document.getElementById("dataTable");

  if (loadingIndicator) loadingIndicator.style.display = "none";
  if (dataTable) dataTable.style.display = "table";

  if (tableBody) tableBody.innerHTML = "";

  
  const filteredData = getFilteredData();

  if (filteredData.length === 0) {
    
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="8" style="text-align: center; padding: 20px; color: #666;">Nenhum dado encontrado com os filtros aplicados</td>`;
    tableBody.appendChild(row);
    
    
    updateSummary(0, 0, 0);
    return;
  }

  
  let total = 0;
  let highest = 0;
  let vehicles = new Set();

  filteredData.forEach((item) => {
    
    const fornecedor = item.A || "";
    const dataEmissao = item.B || "";
    const mes = item.C || "";
    const placa = item.D || "";
    const localidade = item.M || ""; 
    const manutencao = item.F || "";
    const prazoPagamento = item.H || "";
    const precoTexto = item.J || "R$ 0,00";
    const preco = parseFloat(
      precoTexto.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
    ) || 0;
    const descricao = item.L || "";

    
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

    
    total += preco;
    if (preco > highest) highest = preco;
    if (placa) vehicles.add(placa);
  });

  
  updateSummary(total, highest, vehicles.size);
}


function updateSummary(total, highest, vehicleCount) {
  const totalElement = document.getElementById("totalSpent");
  const highestElement = document.getElementById("highestExpense");
  const averageElement = document.getElementById("averagePerVehicle");

  if (totalElement) totalElement.textContent = formatCurrency(total);
  if (highestElement) highestElement.textContent = formatCurrency(highest);
  if (averageElement) {
    const average = vehicleCount > 0 ? total / vehicleCount : 0;
    averageElement.textContent = formatCurrency(average);
  }
}


function setupTableToggle() {
  const toggleBtn = document.getElementById("toggleTableBtn");
  const tableContainer = document.getElementById("tableContainer");
  const toggleIcon = document.getElementById("toggleIcon");
  
  if (!toggleBtn || !tableContainer) return;

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


function setupFilterEvents() {
  const monthFilter = document.getElementById("monthFilter");
  const weekFilter = document.getElementById("weekFilter");
  const placaFilter = document.getElementById("placaFilter");
  const manutencaoFilter = document.getElementById("manutencaoFilter");
  const localidadeFilter = document.getElementById("localidadeFilter");

  
  const filters = [monthFilter, weekFilter, placaFilter, manutencaoFilter, localidadeFilter];
  
  filters.forEach(filter => {
    if (filter) {
      filter.addEventListener("change", function() {
        updateFilters();
      });
    }
  });
}


function updateFilters() {
  
  const loadingIndicator = document.getElementById("loadingIndicator");
  const dataTable = document.getElementById("dataTable");

  if (loadingIndicator) loadingIndicator.style.display = "block";
  if (dataTable) dataTable.style.display = "none";

  
  setTimeout(() => {
    processData();
  }, 100);
}


function clearAllFilters() {
  const monthFilter = document.getElementById("monthFilter");
  const weekFilter = document.getElementById("weekFilter");
  const placaFilter = document.getElementById("placaFilter");
  const manutencaoFilter = document.getElementById("manutencaoFilter");
  const localidadeFilter = document.getElementById("localidadeFilter");

  if (monthFilter) monthFilter.value = "all";
  if (weekFilter) weekFilter.value = "all";
  if (placaFilter) placaFilter.value = "all";
  if (manutencaoFilter) manutencaoFilter.value = "all";
  if (localidadeFilter) localidadeFilter.value = "all";

  updateFilters();
}


function addClearFiltersButton() {
  const filterSection = document.querySelector('.filter-section');
  if (!filterSection) return;

 
  if (document.getElementById('clearFiltersBtn')) return;

  const clearButton = document.createElement('button');
  clearButton.id = 'clearFiltersBtn';
  clearButton.className = 'clear-filters-btn';
  clearButton.innerHTML = '<i class="fas fa-times"></i> Limpar Filtros';
  clearButton.addEventListener('click', clearAllFilters);

  filterSection.appendChild(clearButton);
}



document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupFilterEvents();
  setupTableToggle(); 
  addClearFiltersButton();
});
// ====== CONFIGURAÇÃO DO RELATÓRIO FOTOGRÁFICO ======


window.fotosVeiculos = [];


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


function mesParaNumero(mes) {
  return mesesMap[mes.toLowerCase()] !== undefined
    ? mesesMap[mes.toLowerCase()]
    : -1;
}


function numeroParaMes(numero) {
  return (
    Object.keys(mesesMap).find((key) => mesesMap[key] === parseInt(numero)) ||
    ""
  );
}


function converterLinkGoogleDrive(link) {
  if (!link) return "";
  if (link.includes("thumbnail")) return link;

  const match = link.match(/\/file\/d\/([^\/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return link;
}


function carregarFotosVeiculos() {
  fetch("dados/fotos.json")
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


function popularFiltrosFotos() {
  const mesFilter = document.getElementById("fotoMonthFilter");
  const semanaFilter = document.getElementById("fotoWeekFilter");
  const frotaFilter = document.getElementById("fotoFrotaFilter");

  if (!mesFilter || !semanaFilter || !frotaFilter) {
    console.error("Filtros não encontrados");
    return;
  }

  
  frotaFilter.innerHTML = '<option value="all">Todas as frotas</option>';
  semanaFilter.innerHTML = '<option value="all">Todas as semanas</option>';

 
  frotaFilter.innerHTML += `
    <option value="LEVE">Leve</option>
    <option value="PESADA">Pesada</option>
  `;

  
  const semanas = [...new Set(window.fotosVeiculos.map((v) => v.semana))];
  semanas
    .sort((a, b) => a - b)
    .forEach((semana) => {
      semanaFilter.innerHTML += `<option value="${semana}">Semana ${semana}</option>`;
    });
  // FILTRO PADRÃO FOTOGRAFICO // 
  
  mesFilter.value = "9";
  frotaFilter.value = "Todas as frotas"; 
  if (semanas.includes(1)) {
    semanaFilter.value = "1";
  }

  console.log("Filtros populados:", {
    mes: mesFilter.value,
    semana: semanaFilter.value,
    frota: frotaFilter.value,
  });
}


function abrirVisualizacaoAmpliada(src, alt) {
 
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

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

/************************************************ INICIO RELATORIO STATUS ***********************************************/
function converterData(dataString) {
  if (!dataString) return null;
  
  try {
    const partes = dataString.split('/');
    if (partes.length !== 3) return null;
    
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1; 
    const ano = parseInt(partes[2]);
    
    
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
    
    
    if (dia < 1 || dia > 31) return null;
    if (mes < 0 || mes > 11) return null;
    if (ano < 2000 || ano > 2100) return null;
    
    return new Date(ano, mes, dia);
  } catch (error) {
    console.error('Erro ao converter data:', dataString, error);
    return null;
  }
}

function calcularDiasOficina(dataEntradaString) {
  if (!dataEntradaString) return 0;

  const dataEntrada = converterData(dataEntradaString);
  if (!dataEntrada) return 0;

  const hoje = new Date();
  
  
  const hojeReset = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const entradaReset = new Date(dataEntrada.getFullYear(), dataEntrada.getMonth(), dataEntrada.getDate());
  
  const diffTime = Math.abs(hojeReset - entradaReset);
  const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDias;
}


async function carregarDadosFrota() {
  try {
    const response = await fetch("dados/status.json");
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const data = await response.json();
    exibirDadosFrota(data);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    document.getElementById("frota-table-body").innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #e74c3c; padding: 20px;">
          <i class="fas fa-exclamation-triangle"></i> Erro ao carregar os dados da frota: ${error.message}
        </td>
      </tr>
    `;
  }
}


function exibirDadosFrota(data) {
  const tableBody = document.getElementById("frota-table-body");
  if (!tableBody) {
    console.error('Elemento frota-table-body não encontrado');
    return;
  }
  
  tableBody.innerHTML = "";

  
  if (!data || data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #666; padding: 20px;">
          <i class="fas fa-info-circle"></i> Nenhum dado disponível
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((veiculo, index) => {
    
    let statusClass = "";
    let statusText = "";
    const status = veiculo.STATUS || veiculo.status || "";

    if (status.includes("OPERAÇÃO") || status.includes("OPERAÇAO") || status.includes("OPERACAO")) {
      statusClass = "status-operacao";
      statusText = "EM OPERAÇÃO";
    } else if (status.includes("OCIOSO")) {
      statusClass = "status-ocioso";
      statusText = "OCIOSO";
    } else if (status.includes("OFICINA")) {
      statusClass = "status-oficina";
      statusText = "NA OFICINA";
    } else {
      statusClass = "status-ocioso";
      statusText = status || "STATUS INDEFINIDO";
    }

    
    const row = document.createElement("tr");
    row.classList.add("veiculo-row");
    row.dataset.index = index;

    row.innerHTML = `
      <td class="status-text">
        <span class="status-indicator ${statusClass}"></span>
        ${statusText}
      </td>
      <td>${veiculo.PLACA || veiculo.placa || "N/A"}</td>
      <td>${veiculo.FUNCAO || veiculo.funcao || "N/A"}</td>
      <td>${veiculo.MOTORISTA || veiculo.motorista || "N/A"}</td>
      <td>${veiculo.ENCARREGADO || veiculo.encarregado || "N/A"}</td>
      <td>${veiculo.SUPERVISOR || veiculo.supervisor || "N/A"}</td>
      <td>${veiculo.LOCAL || veiculo.local || "N/A"}</td>
    `;

    tableBody.appendChild(row);

   
    if (status.includes("OFICINA")) {
      const dataEntrada = veiculo["DATA ENTRADA"] || veiculo["DATA_ENTRADA"] || veiculo.data_entrada;
      const diasOficina = calcularDiasOficina(dataEntrada);
      const descricao = veiculo.DESCRICAO || veiculo.descricao || "Sem descrição detalhada";

      const detailsRow = document.createElement("tr");
      detailsRow.classList.add("oficina-details");
      detailsRow.dataset.parentIndex = index;

      
      let dataFormatada = "Data não informada";
      if (dataEntrada) {
        const dataObj = converterData(dataEntrada);
        if (dataObj) {
          dataFormatada = dataObj.toLocaleDateString("pt-BR");
        }
      }

      detailsRow.innerHTML = `
        <td colspan="7">
          <div class="details-content">
            <div class="detail-item">
              <h4>Descrição do Problema</h4>
              <p>${descricao}</p>
            </div>
            <div class="detail-item">
              <h4>Tempo na Oficina</h4>
              <p>Veículo está na oficina há <span class="dias-count ${diasOficina > 30 ? 'dias-alerta' : ''}">${diasOficina} dias</span></p>
              <p>Desde: ${dataFormatada}</p>
            </div>
            ${veiculo.PREVISAO ? `
            <div class="detail-item">
              <h4>Previsão de Saída</h4>
              <p>${veiculo.PREVISAO}</p>
            </div>
            ` : ''}
          </div>
        </td>
      `;

      tableBody.appendChild(detailsRow);
    }
  });

  
  document.querySelectorAll(".veiculo-row").forEach((row) => {
    row.addEventListener("click", function () {
      const index = this.dataset.index;
      const detailsRow = document.querySelector(
        `.oficina-details[data-parent-index="${index}"]`
      );

      if (detailsRow) {
        
        document.querySelectorAll(".oficina-details.active").forEach((detail) => {
          if (detail !== detailsRow) {
            detail.classList.remove("active");
            detail.previousElementSibling.classList.remove("row-selected");
          }
        });

        
        detailsRow.classList.toggle("active");
        this.classList.toggle("row-selected");
      }
    });
  });

  
  inicializarFiltros();
}


function inicializarFiltros() {
  const searchInput = document.getElementById("search-input");
  const filterBtns = document.querySelectorAll(".filter-btn");
  
  if (searchInput) {
    searchInput.addEventListener("input", filtrarTabela);
  }
  
  filterBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      
      filterBtns.forEach(b => b.classList.remove("active"));
      
      this.classList.add("active");
      filtrarTabela();
    });
  });
}


function filtrarTabela() {
  const searchInput = document.getElementById("search-input");
  const activeFilter = document.querySelector(".filter-btn.active");
  
  if (!searchInput) return;
  
  const searchText = searchInput.value.toLowerCase();
  const statusFilter = activeFilter?.dataset.status || "all";
  const rows = document.querySelectorAll(".veiculo-row");
  const detailsRows = document.querySelectorAll(".oficina-details");

  let resultadosVisiveis = 0;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 7) return;

    const statusCell = cells[0].textContent.toLowerCase();
    const placaCell = cells[1].textContent.toLowerCase();
    const funcaoCell = cells[2].textContent.toLowerCase();
    const motoristaCell = cells[3].textContent.toLowerCase();
    const encarregadoCell = cells[4].textContent.toLowerCase();
    const supervisorCell = cells[5].textContent.toLowerCase();
    const localCell = cells[6].textContent.toLowerCase();

    let shouldShow = true;

    
    if (statusFilter !== "all") {
      if (statusFilter === "operacao" && !statusCell.includes("operação") && !statusCell.includes("operacao")) 
        shouldShow = false;
      if (statusFilter === "ocioso" && !statusCell.includes("ocioso")) 
        shouldShow = false;
      if (statusFilter === "oficina" && !statusCell.includes("oficina")) 
        shouldShow = false;
    }

    
    if (searchText) {
      const match = 
        placaCell.includes(searchText) ||
        funcaoCell.includes(searchText) ||
        motoristaCell.includes(searchText) ||
        encarregadoCell.includes(searchText) ||
        supervisorCell.includes(searchText) ||
        localCell.includes(searchText);
      
      if (!match) shouldShow = false;
    }

    row.style.display = shouldShow ? "" : "none";

    
    const index = row.dataset.index;
    const detailsRow = document.querySelector(
      `.oficina-details[data-parent-index="${index}"]`
    );
    
    if (detailsRow) {
      detailsRow.style.display = shouldShow ? "" : "none";
      if (!shouldShow) {
        detailsRow.classList.remove("active");
        row.classList.remove("row-selected");
      }
    }

    if (shouldShow) resultadosVisiveis++;
  });

  
  const mensagemSemResultados = document.getElementById('mensagem-sem-resultados');
  if (!mensagemSemResultados && resultadosVisiveis === 0 && rows.length > 0) {
    const tr = document.createElement('tr');
    tr.id = 'mensagem-sem-resultados';
    tr.innerHTML = `<td colspan="7" style="text-align: center; color: #666; padding: 20px;">
      <i class="fas fa-search"></i> Nenhum veículo encontrado com os filtros aplicados
    </td>`;
    tableBody.appendChild(tr);
  } else if (mensagemSemResultados) {
    mensagemSemResultados.style.display = resultadosVisiveis === 0 ? '' : 'none';
  }
}


function iniciarAtualizacaoAutomatica() {
  
  setInterval(() => {
    const diasElements = document.querySelectorAll('.dias-count');
    diasElements.forEach(element => {
      const parentRow = element.closest('.oficina-details');
      if (parentRow) {
        const dataEntrada = parentRow.querySelector('p:last-child')?.textContent;
        if (dataEntrada && dataEntrada.includes('Desde:')) {
          const dataString = dataEntrada.split('Desde: ')[1];
          if (dataString) {
            const novosDias = calcularDiasOficina(dataString);
            element.textContent = `${novosDias} dias`;
            
            
            if (novosDias > 30) {
              element.classList.add('dias-alerta');
            } else {
              element.classList.remove('dias-alerta');
            }
          }
        }
      }
    });
  }, 3600000); 
}


document.addEventListener('DOMContentLoaded', function() {
  carregarDadosFrota();
  iniciarAtualizacaoAutomatica();
});

/****************************************************** FIM RELATÓRIO STATUS *******************************************/
//******************** SEÇÃO DO RASTREAMENTO ****************** //

let selectedPlaca = null;
let filteredData = [];
let trajetoData = []; 


function converterLinkGoogleDrive(link) {
  if (!link) return "";
  if (link.includes("thumbnail")) return link;

  const match = link.match(/\/file\/d\/([^\/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return link;
}


function carregarDadosRastreio() {
  console.log("Carregando dados de rastreio...");
  
  
  fetch("dados/rastreio.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Arquivo rastreio.json não encontrado");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Dados carregados:", data);
      trajetoData = data;
      init();
    })
    .catch((error) => {
      console.error(error);
     
      trajetoData = [
        {
          A: "01/10/2024",
          B: "ABC1234",
          C: "PESADO",
          D: "150",
          E: "320",
          F: "45",
          G: "365",
          H: "8",
          J: "15",
          M: "https://drive.google.com/thumbnail?id=1example1&sz=w1000",
          N: "Semana 1",
          O: "Outubro"
        },
        {
          A: "02/10/2024", 
          B: "XYZ5678",
          C: "LEVE",
          D: "80",
          E: "180",
          F: "20",
          G: "200",
          H: "5",
          J: "10",
          M: "https://drive.google.com/thumbnail?id=1example2&sz=w1000",
          N: "Semana 1",
          O: "Outubro"
        }
      ];
      console.log("Usando dados de exemplo:", trajetoData);
      init();
    });
}


function init() {
  console.log("Inicializando rastreamento...");
  
 
  document.getElementById("no-data-selected").style.display = "block";
  document.getElementById("details-content").style.display = "none";

  setupEventListeners();
  setupFilters();
}

// CONFIGURAÇÃO PADRÃO DOS FILTROS - OUTUBRO E SEMANA 1
function aplicarFiltroPadrao() {
  console.log("Aplicando filtros padrão...");
  
  const monthFilter = document.getElementById('month-filter');
  const weekFilter = document.getElementById('week-filter');
  
  if (!monthFilter || !weekFilter) {
    console.error("Filtros não encontrados");
    return;
  }

 
  let outubroEncontrado = false;
  for (let option of monthFilter.options) {
    if (option.value.toLowerCase().includes('outubro') || option.text.toLowerCase().includes('outubro')) {
      monthFilter.value = option.value;
      outubroEncontrado = true;
      console.log("Outubro selecionado:", option.value);
      break;
    }
  }
  
  if (!outubroEncontrado && monthFilter.options.length > 1) {
    monthFilter.value = monthFilter.options[1].value;
    console.log("Outubro não encontrado, usando:", monthFilter.options[1].value);
  }

 
  let semana1Encontrada = false;
  for (let option of weekFilter.options) {
    if (option.value.includes('1') || option.text.includes('1')) {
      weekFilter.value = option.value;
      semana1Encontrada = true;
      console.log("Semana 1 selecionada:", option.value);
      break;
    }
  }
  
  if (!semana1Encontrada && weekFilter.options.length > 1) {
    weekFilter.value = weekFilter.options[1].value;
    console.log("Semana 1 não encontrada, usando:", weekFilter.options[1].value);
  }

  
  aplicarFiltros();
}


function setupFilters() {
  console.log("Configurando filtros...");
  
  const monthFilter = document.getElementById("month-filter");
  const weekFilter = document.getElementById("week-filter");
  const placaFilter = document.getElementById("placa-filter");
  const maintenanceFilter = document.getElementById("maintenance-filter");
  const typeFilter = document.getElementById("type-filter");

  if (!monthFilter || !weekFilter || !placaFilter) {
    console.error("Elementos de filtro não encontrados");
    return;
  }

 
  monthFilter.innerHTML = '<option value="all">Todos os meses</option>';
  weekFilter.innerHTML = '<option value="all">Todas as semanas</option>';
  placaFilter.innerHTML = '<option value="all">Todas as placas</option>';

  const mesesUnicos = [...new Set(trajetoData.map((item) => item.O || "Mês não informado"))];
  console.log("Meses únicos:", mesesUnicos);
  
  mesesUnicos.forEach((mes) => {
    const option = document.createElement("option");
    option.value = mes;
    option.textContent = mes;
    monthFilter.appendChild(option);
  });

  const semanasUnicas = [...new Set(trajetoData.map((item) => item.N || "Semana não informada"))];
  console.log("Semanas únicas:", semanasUnicas);
  
  semanasUnicas.forEach((semana) => {
    const option = document.createElement("option");
    option.value = semana;
    option.textContent = semana;
    weekFilter.appendChild(option);
  });

 
  const placasUnicas = [...new Set(trajetoData.map((item) => item.B))].filter(placa => placa);
  console.log("Placas únicas:", placasUnicas);
  
  placasUnicas.forEach((placa) => {
    const option = document.createElement("option");
    option.value = placa;
    option.textContent = placa;
    placaFilter.appendChild(option);
  });

  
  monthFilter.addEventListener("change", aplicarFiltros);
  weekFilter.addEventListener("change", aplicarFiltros);
  placaFilter.addEventListener("change", aplicarFiltros);
  
  if (maintenanceFilter) {
    maintenanceFilter.addEventListener("change", aplicarFiltros);
  }
  
  if (typeFilter) {
    typeFilter.addEventListener("change", aplicarFiltros);
  }

  
  setTimeout(() => {
    aplicarFiltroPadrao();
  }, 100);
}


function aplicarFiltros() {
  console.log("Aplicando filtros...");
  
  const monthFilter = document.getElementById("month-filter");
  const weekFilter = document.getElementById("week-filter");
  const placaFilter = document.getElementById("placa-filter");
  const maintenanceFilter = document.getElementById("maintenance-filter");
  const typeFilter = document.getElementById("type-filter");

  if (!monthFilter || !weekFilter || !placaFilter) {
    console.error("Filtros não encontrados");
    return;
  }

  const mesSelecionado = monthFilter.value;
  const semanaSelecionada = weekFilter.value;
  const placaSelecionada = placaFilter.value;
  const manutencaoSelecionada = maintenanceFilter ? maintenanceFilter.value : "all";
  const tipoSelecionado = typeFilter ? typeFilter.value : "all";

  console.log("Filtros selecionados:", {
    mes: mesSelecionado,
    semana: semanaSelecionada,
    placa: placaSelecionada,
    manutencao: manutencaoSelecionada,
    tipo: tipoSelecionado
  });

  
  let dadosFiltrados = trajetoData;

  if (mesSelecionado !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.O === mesSelecionado);
  }

  if (semanaSelecionada !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.N === semanaSelecionada);
  }

  if (placaSelecionada !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.B === placaSelecionada);
  }

  if (tipoSelecionado !== "all") {
    dadosFiltrados = dadosFiltrados.filter((item) => item.C === tipoSelecionado);
  }


  if (manutencaoSelecionada !== "all") {
    if (manutencaoSelecionada === "com_manutencao") {
      dadosFiltrados = dadosFiltrados.filter((item) => parseInt(item.H) > 15);
    } else {
      dadosFiltrados = dadosFiltrados.filter((item) => parseInt(item.H) <= 15);
    }
  }

  console.log("Dados após filtro:", dadosFiltrados);

 
  const placasFiltradas = [...new Set(dadosFiltrados.map((item) => item.B))].filter(placa => placa);
  console.log("Placas filtradas:", placasFiltradas);


  const placasList = document.getElementById("placas-list");
  if (!placasList) {
    console.error("Elemento placas-list não encontrado");
    return;
  }

  placasList.innerHTML = "";

  placasFiltradas.forEach((placa) => {
   
    const dadosPlaca = dadosFiltrados.filter((item) => item.B === placa);
    const datasPlaca = dadosPlaca.map((item) => item.A).filter(data => data);
    
    let dataRecente = "Data não disponível";
    if (datasPlaca.length > 0) {
      datasPlaca.sort((a, b) => {
        const [diaA, mesA, anoA] = a.split("/").map(Number);
        const [diaB, mesB, anoB] = b.split("/").map(Number);
        return new Date(anoB, mesB - 1, diaB) - new Date(anoA, mesA - 1, diaA);
      });
      dataRecente = datasPlaca[datasPlaca.length - 1];
    }

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

  const placasCount = document.getElementById("placas-count");
  if (placasCount) {
    placasCount.textContent = placasFiltradas.length;
  }

  if (selectedPlaca && !placasFiltradas.includes(selectedPlaca)) {
    document.getElementById("no-data-selected").style.display = "block";
    document.getElementById("details-content").style.display = "none";
    selectedPlaca = null;
  }

  if (placasFiltradas.length === 1 && !selectedPlaca) {
    selectPlaca(placasFiltradas[0]);
  }
}

function selectPlaca(placa) {
  console.log("Selecionando placa:", placa);
  
  selectedPlaca = placa;

  document.querySelectorAll(".placa-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.placa === placa) {
      item.classList.add("active");
    }
  });
  
  document.getElementById("no-data-selected").style.display = "none";
  document.getElementById("details-content").style.display = "block";
  loadPlacaDetails(placa);
}

function loadPlacaDetails(placa) {
  console.log("Carregando detalhes da placa:", placa);
  
  const detailDateFilter = document.getElementById("detail-date-filter");
  const placaText = document.getElementById("placa-text");
  const porteText = document.getElementById("porte-text");

  if (!detailDateFilter || !placaText || !porteText) {
    console.error("Elementos de detalhes não encontrados");
    return;
  }

  filteredData = trajetoData.filter((item) => item.B === placa);

  const monthFilter = document.getElementById("month-filter");
  const weekFilter = document.getElementById("week-filter");

  if (monthFilter && monthFilter.value !== "all") {
    filteredData = filteredData.filter((item) => item.O === monthFilter.value);
  }

  if (weekFilter && weekFilter.value !== "all") {
    filteredData = filteredData.filter((item) => item.N === weekFilter.value);
  }

  console.log("Dados filtrados para a placa:", filteredData);

  placaText.textContent = placa;

  if (filteredData.length > 0) {
    porteText.textContent = filteredData[0].C || "Porte não informado";
  }

  detailDateFilter.innerHTML = "";
  const datasPlaca = [...new Set(filteredData.map((item) => item.A))].filter(data => data);
  
  datasPlaca.sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/").map(Number);
    const [dayB, monthB, yearB] = b.split("/").map(Number);
    return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
  });

  datasPlaca.forEach((data) => {
    const option = document.createElement("option");
    option.value = data;

    const [dia, mes, ano] = data.split("/").map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const diaSemana = diasSemana[dataObj.getDay()];

    option.textContent = `${diaSemana} - ${data}`;
    detailDateFilter.appendChild(option);
  });

  if (datasPlaca.length > 0) {
    detailDateFilter.value = datasPlaca[0];
    showDataForDate(datasPlaca[0]);
  } else {
    const detailsGrid = document.querySelector(".details-grid");
    if (detailsGrid) {
      detailsGrid.innerHTML = '<div class="no-data"><i class="fas fa-exclamation-circle"></i><p>Nenhum dado encontrado para esta placa</p></div>';
    }
  }
}

function showDataForDate(data) {
  console.log("Mostrando dados para data:", data);
  
  const mapImage = document.getElementById("map-image");
  const mapPlaceholder = document.getElementById("map-placeholder");
  const detailsGrid = document.querySelector(".details-grid");

  if (!mapImage || !mapPlaceholder || !detailsGrid) {
    console.error("Elementos de exibição não encontrados");
    return;
  }

  const dataItem = filteredData.find((item) => item.A === data);

  if (!dataItem) {
    detailsGrid.innerHTML = '<div class="no-data"><i class="fas fa-exclamation-circle"></i><p>Nenhum dado encontrado para esta data</p></div>';
    return;
  }

  detailsGrid.innerHTML = `
    <div class="detail-card">
      <h3>Data</h3>
      <div class="detail-value">${dataItem.A || 'Não informado'}</div>
    </div>
    <div class="detail-card">
      <h3>Distância Percorrida</h3>
      <div class="detail-value">${dataItem.D || '0'} <span class="detail-unit">km</span></div>
    </div>
    <div class="detail-card">
      <h3>Tempo de Motor Ocioso</h3>
      <div class="detail-value">${dataItem.F || '0'} <span class="detail-unit">min</span></div>
    </div>
    <div class="detail-card">
      <h3>Porte</h3>
      <div class="detail-value">${dataItem.C || 'Não informado'}</div>
    </div>
    <div class="detail-card">
      <h3>Tempo Total Dirigido</h3>
      <div class="detail-value">${dataItem.E || '0'} <span class="detail-unit">min</span></div>
    </div>
    <div class="detail-card">
      <h3>Total de Paradas</h3>
      <div class="detail-value">${dataItem.H || '0'} <span class="detail-unit">paradas</span></div>
    </div>
    <div class="detail-card">
      <h3>Tempo Médio de Cada Parada</h3>
      <div class="detail-value">${dataItem.J || '0'} <span class="detail-unit">min</span></div>
    </div>
    <div class="detail-card">
      <h3>Tempo Total de Motor Ligado</h3>
      <div class="detail-value">${dataItem.G || '0'} <span class="detail-unit">min</span></div>
    </div>
  `;

  if (dataItem.M) {
    const convertedLink = converterLinkGoogleDrive(dataItem.M);
    
    mapPlaceholder.style.display = "flex";
    mapImage.style.display = "none";

    const testImage = new Image();
    testImage.onload = function () {
      mapImage.src = convertedLink;
      mapImage.style.display = "block";
      mapPlaceholder.style.display = "none";
      mapImage.dataset.original = dataItem.M;
    };
    testImage.onerror = function () {
      mapPlaceholder.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Não foi possível carregar o mapa</p>';
      mapPlaceholder.style.display = "flex";
      mapImage.style.display = "none";
    };
    testImage.src = convertedLink;
  } else {
    mapPlaceholder.innerHTML = '<i class="fas fa-map"></i><p>Nenhum mapa disponível</p>';
    mapPlaceholder.style.display = "flex";
    mapImage.style.display = "none";
  }
}

function setupEventListeners() {
  console.log("Configurando event listeners...");
  
  const searchPlacas = document.getElementById("search-placas");
  if (searchPlacas) {
    searchPlacas.addEventListener("input", function () {
      const searchText = this.value.toLowerCase();
      document.querySelectorAll(".placa-item").forEach((item) => {
        const placa = item.dataset.placa.toLowerCase();
        item.style.display = placa.includes(searchText) ? "flex" : "none";
      });
    });
  }

  const detailDateFilter = document.getElementById("detail-date-filter");
  if (detailDateFilter) {
    detailDateFilter.addEventListener("change", function () {
      showDataForDate(this.value);
    });
  }

  const closePanel = document.getElementById("close-panel");
  if (closePanel) {
    closePanel.addEventListener("click", function () {
      document.getElementById("no-data-selected").style.display = "block";
      document.getElementById("details-content").style.display = "none";
      document.querySelectorAll(".placa-item").forEach((item) => {
        item.classList.remove("active");
      });
      selectedPlaca = null;
    });
  }

  const mapImage = document.getElementById("map-image");
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-image");
  const closeModal = document.getElementById("close-modal");

  if (mapImage && modal && modalImg && closeModal) {
    mapImage.addEventListener("click", function () {
      const originalLink = this.dataset.original;
      if (originalLink) {
        modalImg.src = converterLinkGoogleDrive(originalLink);
        modal.style.display = "block";
      }
    });

    closeModal.addEventListener("click", function () {
      modal.style.display = "none";
    });

    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM carregado, iniciando rastreamento...");
  carregarDadosRastreio();
});
//*********************************** FIM DA SEÇÃO DO RASTREAMENTO *****************************************//

//*********************************** INICIO SEÇÃO RELATÓRIO FOTOGRÁFICO  *********************************/
// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  carregarDadosFrota();

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

  document.querySelector('[data-status="all"]').classList.add("active");
});
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
    if (mesFiltro !== "all" && veiculo.mesNumero != mesFiltro) {
      console.log("Filtrando mês:", veiculo.mesNumero, "!=", mesFiltro);
      return false;
    }

    if (semanaFiltro !== "all" && veiculo.semana != semanaFiltro) {
      console.log("Filtrando semana:", veiculo.semana, "!=", semanaFiltro);
      return false;
    }

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

document.addEventListener("DOMContentLoaded", () => {
  addStyles();
  configurarFiltrosFotos();
  carregarFotosVeiculos();

  window.abrirVisualizacaoAmpliada = abrirVisualizacaoAmpliada;
  window.carregarRelatorioFotografico = carregarRelatorioFotografico;
});
/***************************************** FIM DO RELATÓRIO FOTOGRÁFICO **********************************************/
// *************************************** INICIO DO RELATÓRIO DE MANUTENÇÃO *************************************  //

window.manutencaoData = [];

function carregarManutencaoData() {
  fetch("dados/manutencao.json")
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


function processarManutencaoData(dados) {
  if (!dados || dados.length === 0) {
    mostrarMensagemErroManutencao("Nenhum dado de manutenção disponível");
    return;
  }

  window.manutencaoData = dados.map((item) => {
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

function popularFiltrosManutencao() {
  const mesFilter = document.getElementById("manutencaoMonthFilter");
  const semanaFilter = document.getElementById("manutencaoWeekFilter");
  const placaFilter = document.getElementById("manutencaoPlacaFilter");
  const tipoFilter = document.getElementById("manutencaoTipoFilter");

  if (!mesFilter || !semanaFilter || !placaFilter || !tipoFilter) return;

  placaFilter.innerHTML = '<option value="all">Todas as placas</option>';
  semanaFilter.innerHTML = '<option value="all">Todas as semanas</option>';
  tipoFilter.innerHTML = '<option value="all">Todos os tipos</option>';

  const placas = [...new Set(window.manutencaoData.map((v) => v.placa))];
  placas.forEach((placa) => {
    placaFilter.innerHTML += `<option value="${placa}">${placa}</option>`;
  });

  const semanas = [...new Set(window.manutencaoData.map((v) => v.semana))];
  semanas
    .sort((a, b) => a - b)
    .forEach((semana) => {
      semanaFilter.innerHTML += `<option value="${semana}">Semana ${semana}</option>`;
    });

  const tipos = [...new Set(window.manutencaoData.map((v) => v.tipo))];
  tipos.forEach((tipo) => {
    tipoFilter.innerHTML += `<option value="${tipo}">${tipo}</option>`;
  });
  // VALOR PADRAO FILTRO MANUTENCAO //
  // Definir valores padrão
  mesFilter.value = "9"; 

  // ALTERAÇÃO AQUI:
  if (semanas.includes(2)) {
    semanaFilter.value = "2";
  } else if (semanas.length > 0) {
    
    semanaFilter.value = semanas[0].toString();
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  configurarFiltrosManutencao();
  carregarManutencaoData();
  /********************************************* FIM DO RELATÓRIO DE MANUTEÇÃO ******************************************/
});