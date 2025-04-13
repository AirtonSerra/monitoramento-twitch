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
            caixa.style.bottom = '70px';
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
                console.log('🎯 ' + nome + ' — Categoria atual: ' + categoria);

                if (categoria === CATEGORIA_ALVO) {
                    tocarAlerta();
                    mostrarMensagem(
                        '🚨 ' + nome + ' mudou para: ' + categoria,
                        '#F44336',
                        true,
                        function () {
                            delete window.monitoramentoExecutando;
                        }
                    );
                    pararMonitoramento();
                }
                return;
            }
        }
        console.log('Canal não encontrado.');
    }

    // Função para adicionar o botão de parar monitoramento
    function adicionarBotao() {
        if (!document.getElementById('monitor-btn')) {
            const btn = document.createElement('button');
            btn.textContent = '⏹ Parar monitoramento';
            btn.id = 'monitor-btn';
            btn.style.position = 'fixed';
            btn.style.bottom = '20px';
            btn.style.right = '20px';
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

        // Variáveis globais
        window.beepAlerta = null;

        // Configurações
        const NOME_CANAL = 'SkipNhO';
        const CATEGORIA_ALVO = 'Só Na Conversa';
        const INTERVALO = 10 * 1000;

        // Inicialização do monitoramento
        setTimeout(adicionarBotao, 1000);
        window.monitoramentoExecutando = true;
        window.monitorIntervaloId = setInterval(function () {
            verificarCategoria(NOME_CANAL, CATEGORIA_ALVO);
        }, INTERVALO);
        mostrarMensagem(`🎉 Monitoramento do canal ${NOME_CANAL} ativado!`, '#4CAF50');
    }

    main();
})();
