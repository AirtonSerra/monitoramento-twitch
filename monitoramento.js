// Monitoramento de Categoria de Canais da Twitch
// Versão formatada para manutenção

javascript: (function () {
    // Função para criar a caixa de mensagem
    function criarCaixaMensagem(executarAoFechar = undefined) {
        let caixa = document.getElementById('mensagem-caixa');

        const funcaoFechar = function () {
            caixa.style.display = 'none';
            pararAlerta();
            if (typeof executarAoFechar === 'function') {
                executarAoFechar();
            }
        };

        if (!caixa) {
            caixa = document.createElement('div');
            caixa.id = 'mensagem-caixa';
            caixa.style.position = 'fixed';
            caixa.style.bottom = '92px';
            caixa.style.right = '20px';
            caixa.style.zIndex = '99998';
            caixa.style.padding = '15px';
            caixa.style.backgroundColor = '#1f1f23';
            caixa.style.color = 'white';
            caixa.style.borderRadius = '8px';
            caixa.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            caixa.style.maxWidth = '300px';
            caixa.style.display = 'none';

            const btnFechar = document.createElement('button');
            btnFechar.textContent = '×';
            btnFechar.style.position = 'absolute';
            btnFechar.style.top = '5px';
            btnFechar.style.right = '5px';
            btnFechar.style.background = 'none';
            btnFechar.style.border = 'none';
            btnFechar.style.color = 'white';
            btnFechar.style.cursor = 'pointer';
            btnFechar.style.fontSize = '16px';
            btnFechar.onclick = funcaoFechar;

            const conteudo = document.createElement('div');
            conteudo.style.paddingRight = '10px';
            conteudo.id = 'mensagem-conteudo';
            caixa.appendChild(conteudo);
            caixa.appendChild(btnFechar);
            document.body.appendChild(caixa);
        } else {
            // Se a caixa já existe, atualiza o onclick do botão de fechar
            const btnFechar = caixa.querySelector('button');
            if (btnFechar) {
                btnFechar.onclick = funcaoFechar;
            }
        }
        return caixa;
    }

    // Função para mostrar mensagens
    function mostrarMensagem(
        texto,
        corFundo = '#1f1f23',
        persistente = false,
        executarAoFechar = undefined
    ) {
        const caixa = criarCaixaMensagem(executarAoFechar);
        const conteudo = document.getElementById('mensagem-conteudo');
        conteudo.textContent = texto;
        caixa.style.backgroundColor = corFundo;
        caixa.style.display = 'block';

        if (!persistente) {
            setTimeout(function () {
                caixa.style.opacity = '0';
                setTimeout(function () {
                    caixa.style.display = 'none';
                    caixa.style.opacity = '1';
                }, 500);
            }, 3000);
        }
    }

    // Função para parar o alerta
    function pararAlerta() {
        if (window.beepAlerta) {
            window.beepAlerta.pause();
            window.beepAlerta = null;
        }
    }

    // Função para parar o monitoramento
    function pararMonitoramento(resetarMonitoramento = false) {
        clearInterval(window.monitorIntervaloId);
        document.getElementById('monitor-btn')?.remove();
        if (resetarMonitoramento) {
            delete window.monitoramentoExecutando;
        }
    }

    // Função para verificar a categoria do canal
    function verificarCategoria(NOME_CANAL, CATEGORIA_ALVO) {
        const elementos = document.querySelectorAll('[data-a-id^="followed-channel"]');

        for (let el of elementos) {
            const nomeEl = el.querySelector('[data-a-target="side-nav-title"]');
            const categoriaEl = el.querySelector('[data-a-target="side-nav-game-title"]');

            if (!nomeEl || !categoriaEl) continue;

            const nome = nomeEl.textContent.trim();
            const categoria = categoriaEl.textContent.trim();

            if (nome.toLowerCase() === NOME_CANAL.toLowerCase()) {
                if (categoria.toLowerCase() === CATEGORIA_ALVO.toLowerCase()) {
                    tocarAlerta();
                    mostrarMensagem(
                        '🚨 ' + nome + ' está em: ' + categoria,
                        '#F44336',
                        true,
                        function () {
                            delete window.monitoramentoExecutando;
                        }
                    );
                    pararMonitoramento();
                    return true;
                }
            }
        }
        return false;
    }

    // Função para adicionar o botão de parar monitoramento
    function botaoPararMonitoramento() {
        if (!document.getElementById('monitor-btn')) {
            const btn = document.createElement('button');
            btn.textContent = '⏹ Parar monitoramento';
            btn.id = 'monitor-btn';
            btn.style.position = 'fixed';
            btn.style.top = '5px';
            btn.style.right = '464px';
            btn.style.zIndex = '99999';
            btn.style.padding = '10px 15px';
            btn.style.backgroundColor = '#9146FF';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '8px';
            btn.style.fontSize = '14px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';

            btn.onmouseenter = function () {
                btn.style.backgroundColor = '#772CE8';
            };

            btn.onmouseleave = function () {
                btn.style.backgroundColor = '#9146FF';
            };

            btn.onclick = function () {
                pararMonitoramento(true);
                mostrarMensagem('🛑 Monitoramento manualmente desativado', '#FF9800');
            };

            document.body.appendChild(btn);
        }
    }

    // Função para tocar o alerta sonoro
    function tocarAlerta() {
        if (!window.beepAlerta) {
            window.beepAlerta = new Audio(
                'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
            );
            window.beepAlerta.loop = true;
            window.beepAlerta.play().catch(function (e) {
                console.log('Erro ao reproduzir áudio:', e);
            });
        }
    }

    // Função para verificar se o canal existe
    function verificarCanalExiste(NOME_CANAL) {
        const elementos = document.querySelectorAll('[data-a-id^="followed-channel"]');
        for (let el of elementos) {
            const nomeEl = el.querySelector('[data-a-target="side-nav-title"]');
            if (!nomeEl) continue;
            const nome = nomeEl.textContent.trim();
            if (nome.toLowerCase() === NOME_CANAL.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    function main() {
        // Verifica se está na página da Twitch
        if (!window.location.hostname.includes('twitch.tv')) {
            alert('❌ Este bookmarklet só funciona na página da Twitch!');
            return;
        }

        if (window.monitoramentoExecutando === true) {
            pararMonitoramento(true);
            pararAlerta();
            mostrarMensagem('✅ Monitoramento desativado', '#4CAF50');
            return;
        }

        // Solicita as informações do usuário
        const NOME_CANAL = prompt('Digite o nome do canal que deseja monitorar:');
        if (!NOME_CANAL) {
            mostrarMensagem('❌ Nome do canal não informado', '#F44336');
            return;
        }

        // Verifica se o canal existe antes de continuar
        if (!verificarCanalExiste(NOME_CANAL)) {
            mostrarMensagem(
                '❌ Canal não encontrado. Se o canal está online e se o nome está correto.',
                '#F44336',
                true
            );
            return;
        }

        const CATEGORIA_ALVO = prompt('Digite a categoria que deseja monitorar:');
        if (!CATEGORIA_ALVO) {
            mostrarMensagem('❌ Categoria não informada', '#F44336');
            return;
        }

        if (!verificarCategoria(NOME_CANAL, CATEGORIA_ALVO)) {
            setTimeout(botaoPararMonitoramento, 100);

            // Variáveis globais
            window.beepAlerta = null;

            // Configurações
            const INTERVALO = 10 * 1000;

            // Inicialização do monitoramento
            window.monitoramentoExecutando = true;
            window.monitorIntervaloId = setInterval(function () {
                verificarCategoria(NOME_CANAL, CATEGORIA_ALVO);
            }, INTERVALO);
        }
    }

    main();
})();
