document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-agendar");
    const tabelaHorarios = document.getElementById("tabela-horarios").getElementsByTagName('tbody')[0];

    // Função para converter data e hora em um objeto Date
    const converterParaDate = (data, hora) => {
        return new Date(`${data}T${hora}`);
    };

    // Função para formatar a data para o padrão brasileiro (DD/MM/AAAA)
    const formatarDataBrasileira = (data) => {
        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    };

    // Função para carregar e ordenar horários
    const carregarHorarios = () => {
        const horarios = JSON.parse(localStorage.getItem("horarios")) || [];
        const agora = new Date();

        // Ordenar horários pela data e hora mais próxima do horário atual
        horarios.sort((a, b) => {
            const dateA = converterParaDate(a.data, a.hora);
            const dateB = converterParaDate(b.data, b.hora);
            return dateA - dateB; // Ordem crescente (o mais próximo do atual primeiro)
        });

        // Limpar tabela antes de carregar novos horários
        tabelaHorarios.innerHTML = "";

        // Adicionar os horários à tabela
        horarios.forEach((horario, index) => {
            const row = tabelaHorarios.insertRow();
            row.insertCell(0).textContent = horario.equipe;
            row.insertCell(1).textContent = formatarDataBrasileira(horario.data); // Exibe a data no formato brasileiro
            row.insertCell(2).textContent = horario.hora;
            row.insertCell(3).textContent = horario.tipo; // Exibe o tipo de partida

            // Botão de excluir em uma nova célula (coluna separada)
            const btnExcluir = document.createElement("button");
            btnExcluir.textContent = "Excluir";
            btnExcluir.onclick = () => {
                removerHorario(index);
            };
            const cellExcluir = row.insertCell(4); // Coluna separada para o botão
            cellExcluir.appendChild(btnExcluir);
        });
    };

    // Função para remover um horário
    const removerHorario = (index) => {
        const horarios = JSON.parse(localStorage.getItem("horarios")) || [];
        horarios.splice(index, 1); // Remove o horário específico
        localStorage.setItem("horarios", JSON.stringify(horarios)); // Atualiza o localStorage
        carregarHorarios(); // Recarrega a tabela
    };

    // Função para verificar e remover horários que passaram mais de 10 minutos do horário atual
    const removerHorariosAtrasados = () => {
        const horarios = JSON.parse(localStorage.getItem("horarios")) || [];
        const agora = new Date();

        // Filtrar horários que ainda são válidos (menos de 10 minutos atrasados)
        const horariosAtualizados = horarios.filter(horario => {
            const horarioDate = converterParaDate(horario.data, horario.hora);
            return (agora - horarioDate) <= 10 * 60 * 1000; // 10 minutos em milissegundos
        });

        // Se houver horários removidos, atualizar o localStorage
        if (horarios.length !== horariosAtualizados.length) {
            localStorage.setItem("horarios", JSON.stringify(horariosAtualizados));
            carregarHorarios(); // Recarregar a tabela
        }
    };

    // Adicionar horário no formulário
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const equipe = document.getElementById("equipe").value;
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;
        const tipo = document.getElementById("tipo").value; // Captura o tipo de partida

        const novoHorario = { equipe, data, hora, tipo }; // Adiciona o tipo no objeto

        // Carregar horários existentes
        const horarios = JSON.parse(localStorage.getItem("horarios")) || [];

        // Verificar se a equipe já tem dois horários agendados para o mesmo dia
        const horariosEquipeNoDia = horarios.filter(horario => horario.equipe === equipe && horario.data === data);
        
        if (horariosEquipeNoDia.length >= 2) {
            alert("Essa equipe já tem dois horários agendados para o mesmo dia.");
            return; // Impede o agendamento de mais de dois horários por dia para a mesma equipe
        }

        // Verificar se o horário já está agendado
        const horarioExistente = horarios.find(horario => horario.data === data && horario.hora === hora);
        
        if (horarioExistente) {
            alert("Esse horário já está agendado por outra equipe. Escolha outro horário.");
            return; // Impede o agendamento
        }

        // Adicionar o novo horário
        horarios.push(novoHorario);
        localStorage.setItem("horarios", JSON.stringify(horarios));

        // Recarregar a tabela
        carregarHorarios();
        
        // Limpar o formulário
        form.reset();
    });

    // Carregar os horários na inicialização
    carregarHorarios();

    // Chamar a função de remoção de horários atrasados a cada minuto (60 segundos)
    setInterval(removerHorariosAtrasados, 60 * 1000); // 60 segundos em milissegundos
});
