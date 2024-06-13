document.addEventListener('DOMContentLoaded', () => {
    function carregarPagina(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                const novoConteudo = new DOMParser().parseFromString(data, 'text/html').querySelector('.principal').innerHTML;
                document.querySelector('.principal').innerHTML = novoConteudo;
                window.history.pushState({}, '', url);
                reanexarEventListeners();
            })
            .catch(error => console.log('Erro ao carregar a página: ', error));
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pagina = e.target.getAttribute('href');
            carregarPagina(pagina);
        });
    });

    function adicionarPedido(produto, preco) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const pedidoExistente = pedidos.find(pedido => pedido.produto === produto);
        if (pedidoExistente) {
            pedidoExistente.quantidade += 1;
        } else {
            pedidos.push({ produto, preco, quantidade: 1 });
        }
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        atualizarTotalCarrinho();
        alert(`Pedido de ${produto} adicionado!`);
    }

    function removerPedido(produto) {
        let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        pedidos = pedidos.filter(pedido => pedido.produto !== produto);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        carregarPedidos();
        atualizarTotalCarrinho();
    }

    function atualizarTotalCarrinho() {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        let total = 0;
        pedidos.forEach(pedido => {
            total += pedido.preco * pedido.quantidade;
        });
        document.querySelector('.total-cartao').textContent = `Total: R$${total.toFixed(2)}`;
        if (document.querySelector('.preco-total')) {
            document.querySelector('.preco-total').textContent = `Preço final das bebidas selecionadas: R$${total.toFixed(2)}`;
        }
    }

    function anexarEventListenersBotaoAdicionar() {
        document.querySelectorAll('.add-bttn').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const elementoProduto = e.target.closest('.item-row').querySelector('.bebida');
                const elementoPreco = e.target.closest('.item-row').querySelector('.preco');
                const produto = elementoProduto.textContent;
                const preco = parseFloat(elementoPreco.textContent);
                adicionarPedido(produto, preco);
            });
        });
    }

    function anexarEventListenersBotaoRemover() {
        document.querySelectorAll('.remove-bttn').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const elementoProduto = e.target.closest('.order-row').querySelector('.product-name');
                const produto = elementoProduto.textContent;
                removerPedido(produto);
            });
        });
    }

    function carregarPedidos() {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const listaPedidos = document.querySelector('.lista-pedidos');
        listaPedidos.innerHTML = '';
        if (pedidos.length === 0) {
            listaPedidos.textContent = 'Nenhum pedido realizado.';
        } else {
            pedidos.forEach(pedido => {
                const elementoPedido = document.createElement('div');
                elementoPedido.classList.add('order-row');
                elementoPedido.innerHTML = `
                    <p class="product-name">${pedido.quantidade} x ${pedido.produto} - R$${(pedido.preco * pedido.quantidade).toFixed(2)}</p>
                    <button class="remove-bttn">Remover da lista de pedidos</button>
                `;
                listaPedidos.appendChild(elementoPedido);
            });
        }
        anexarEventListenersBotaoRemover();
    }
    
    function adicionarCartaoCredito(event) {
        event.preventDefault();
        const numeroCartao = document.getElementById('numero-cartao').value;
        const nomeCartao = document.getElementById('nome-cartao').value;
        const dataValidade = document.getElementById('data-vencimento').value;
        const cvv = document.getElementById('cvv').value;
        const cartaoCredito = { numeroCartao, nomeCartao, dataValidade, cvv };
        const cartoes = JSON.parse(localStorage.getItem('cartoes')) || [];
        cartoes.push(cartaoCredito);
        localStorage.setItem('cartoes', JSON.stringify(cartoes));
        alert('Cartão de crédito adicionado com sucesso!');
        exibirCartoes();
    }

    function exibirCartoes() {
        const cartoes = JSON.parse(localStorage.getItem('cartoes')) || [];
        const listaCartoes = document.querySelector('.cartoes-lista');
        listaCartoes.innerHTML = '';
        if (cartoes.length === 0) {
            listaCartoes.textContent = 'Nenhum cartão adicionado.';
        } else {
            cartoes.forEach(cartao => {
                const elementoCartao = document.createElement('p');
                elementoCartao.textContent = `Número: ${cartao.numeroCartao}, Nome: ${cartao.nomeCartao}, Validade: ${cartao.dataValidade}, CVV: ${cartao.cvv}`;
                listaCartoes.appendChild(elementoCartao);
            });
        }
    }

    function verificarPagina() {
        if (window.location.href.includes('pedidos.html')) {
            carregarPedidos();
            const formularioCartaoCredito = document.getElementById('credito-form');
            if (formularioCartaoCredito) {
                formularioCartaoCredito.addEventListener('submit', adicionarCartaoCredito);
            }
            exibirCartoes();
        }
    }

    function reanexarEventListeners() {
        anexarEventListenersBotaoAdicionar();
        verificarPagina();
    }

    anexarEventListenersBotaoAdicionar();
    atualizarTotalCarrinho();
    verificarPagina();

    window.addEventListener('popstate', () => {
        verificarPagina();
    });

    function configurarMensagensValidacaoCustomizadas() {
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.target.setCustomValidity('Preencha o campo para beber feliz!');
            });

            input.addEventListener('input', (e) => {
                e.target.setCustomValidity('');
            });
        });
    }

    configurarMensagensValidacaoCustomizadas();
});
