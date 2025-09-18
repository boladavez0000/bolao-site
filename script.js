function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tabName === 'acertos') loadReport('resultados/data/acertos.json', 'acertos-content');
    if (tabName === 'alfabetica') loadReport('resultados/data/alfabetica.json', 'alfabetica-content');
}

function loadReport(jsonUrl, contentId) {
    const content = document.getElementById(contentId);
    content.innerHTML = '<p>Carregando...</p>';

    // Tentativa de fetch para carregar o JSON
    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) throw new Error('Arquivo não encontrado');
            return response.json();
        })
        .then(data => {
            content.innerHTML = '';

            const header = document.createElement('div');
            header.classList.add('header');

            const periodo = document.createElement('p');
            periodo.classList.add('periodo');
            periodo.textContent = `Período: ${data.periodo || 'Não especificado'}`;
            header.appendChild(periodo);

            if (data.gruposApurados) {
                data.gruposApurados.forEach(grupo => {
                    const grupoP = document.createElement('p');
                    grupoP.classList.add('grupo');
                    grupoP.textContent = `(${grupo.data || 'Sem data'}): ${grupo.numeros ? grupo.numeros.map(n => n.toString().padStart(2, '0')).join(', ') : 'Sem números'} - ${grupo.hora || 'Sem hora'}`;
                    header.appendChild(grupoP);
                });
            }

            content.appendChild(header);

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Seq', 'Apostador', 'Vendedor', 'Aposta', 'Aposta Completa', 'Acerto'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            if (data.linhas && Array.isArray(data.linhas)) {
                data.linhas.forEach((linha, index) => {
                    const tr = document.createElement('tr');
                    [index + 1, linha.apostador, linha.vendedor, linha.apostaNum, linha.apostaCompleta, linha.acerto].forEach((value, idx) => {
                        const td = document.createElement('td');
                        if (idx === 4 && Array.isArray(value)) { // Coluna Aposta Completa
                            value.forEach(num => {
                                const span = document.createElement('span');
                                span.classList.add('numero');
                                span.textContent = num.toString().padStart(2, '0') + ' ';
                                if (linha.numerosAcertados && linha.numerosAcertados.includes(num)) {
                                    span.classList.add('acertado');
                                    const idx = linha.numerosAcertados.indexOf(num);
                                    if (idx > -1) linha.numerosAcertados.splice(idx, 1);
                                }
                                td.appendChild(span);
                            });
                        } else {
                            td.textContent = value !== undefined ? value.toString() : 'N/A';
                        }
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
            } else {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 6;
                td.textContent = 'Nenhum dado disponível.';
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            content.appendChild(table);

            const rodape = document.createElement('p');
            rodape.classList.add('rodape');
            rodape.textContent = `Prêmio Total: R$ ${(data.premio || 0).toFixed(2)} - Atualizado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;
            content.appendChild(rodape);
        })
        .catch(error => {
            console.error('Erro ao carregar JSON:', error);
            content.innerHTML = '<p class="error-message">Erro ao carregar os resultados. Verifique se os arquivos JSON estão em resultados/data/ e use um servidor web local (ex: XAMPP).</p>';
        });
}

// Carrega acertos por padrão ao iniciar
window.onload = function() {
    loadReport('resultados/data/acertos.json', 'acertos-content');
};