
// Carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página de productos cargada');
    iniciarApp();
    crearBadgeCarrito();
    mostrarCarrito();
});

function iniciarApp() {
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    console.log('Botones encontrados:', botonesAgregar.length);
    
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            agregarAlCarrito(e);
        });
    });
    
    const btnVaciar = document.querySelector('#vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', function(e) {
            e.preventDefault();
            vaciarCarrito();
        });
    }

    const btnFinalizar = document.querySelector('#finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', function(e) {
            e.preventDefault();
            finalizarCompra();
        });
    }
    
    const tbody = document.querySelector('#lista-carrito tbody');
    if (tbody) {
        tbody.addEventListener('click', function(e) {
            if (e.target.classList.contains('borrar-producto')) {
                e.preventDefault();
                eliminarProducto(e);
            }
        });
    }
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function crearBadgeCarrito() {
    const imgCarrito = document.querySelector('#img-carrito');
    if (!imgCarrito) return;
    
    let badge = document.querySelector('#carrito-badge');
    
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'carrito-badge';
        const submenu = imgCarrito.parentElement;
        submenu.style.position = 'relative';
        submenu.appendChild(badge);
    }
    
    actualizarBadgeCarrito();
}

function actualizarBadgeCarrito() {
    const badge = document.querySelector('#carrito-badge');
    if (!badge) return;
    
    const totalProductos = obtenerCantidadTotal();
    
    if (totalProductos > 0) {
        badge.textContent = totalProductos;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-carrito notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    if (!document.querySelector('#notificacion-styles')) {
        const style = document.createElement('style');
        style.id = 'notificacion-styles';
        style.textContent = `
            .notificacion-carrito {
                position: fixed;
                top: 20px;
                right: 20px;
                color: #2C2C2C;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                font-size: 14px;
                font-weight: 500;
                animation: slideIn 0.3s ease-out;
                min-width: 250px;
            }
            .notificacion-success { background: #E8D5D8; }
            .notificacion-error { background: #C4A4A8; }
            .notificacion-info { background: #DCD5E0; }
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

function agregarAlCarrito(e) {
    const producto = e.target.parentElement.parentElement;
    
    const infoProducto = {
        imagen: producto.querySelector('img').src,
        titulo: producto.querySelector('h3').textContent,
        precio: producto.querySelector('.precio').textContent,
        id: e.target.getAttribute('data-id'),
        cantidad: 1
    };
    
    const existe = carrito.find(prod => prod.id === infoProducto.id);
    
    if (existe) {
        carrito = carrito.map(prod => {
            if (prod.id === infoProducto.id) {
                prod.cantidad++;
            }
            return prod;
        });
        mostrarNotificacion('¡Cantidad actualizada!', 'success');
    } else {
        carrito.push(infoProducto);
        mostrarNotificacion('¡Producto agregado al carrito!', 'success');
    }
    
    guardarCarrito();
    mostrarCarrito();
    actualizarBadgeCarrito();
}

function mostrarCarrito() {
    const tbody = document.querySelector('#lista-carrito tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (carrito.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="carrito-vacio">Carrito vacío</td></tr>';
        return;
    }
    
    carrito.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${producto.imagen}"></td>
            <td>${producto.titulo}</td>
            <td>${producto.precio}</td>
            <td>${producto.cantidad}</td>
            <td><a href="#" class="borrar-producto" data-id="${producto.id}">✕</a></td>
        `;
        tbody.appendChild(row);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.className = 'carrito-total';
    const total = calcularTotal();
    
    totalRow.innerHTML = `
        <td colspan="2" class="carrito-total-label">TOTAL:</td>
        <td colspan="3" class="carrito-total-amount">$${total.toLocaleString('es-AR')}</td>
    `;
    tbody.appendChild(totalRow);
}

function calcularTotal() {
    let total = 0;
    
    carrito.forEach(producto => {
        if (producto.precio.toLowerCase().includes('consultar')) {
            return;
        }
        
        const precioLimpio = producto.precio.replace(/\$|\.|\s/g, '');
        const precio = parseFloat(precioLimpio);
        
        if (!isNaN(precio)) {
            total += precio * producto.cantidad;
        }
    });
    
    return total;
}

function eliminarProducto(e) {
    const id = e.target.getAttribute('data-id');
    const productoEliminado = carrito.find(prod => prod.id === id);
    
    carrito = carrito.filter(producto => producto.id !== id);
    
    if (productoEliminado) {
        mostrarNotificacion('¡Producto eliminado!', 'error');
    }
    
    guardarCarrito();
    mostrarCarrito();
    actualizarBadgeCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('¡El carrito ya está vacío!', 'info');
        return;
    }
    
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
    actualizarBadgeCarrito();
    mostrarNotificacion('¡Carrito vaciado!', 'success');
}

function obtenerCantidadTotal() {
    return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('¡Tu carrito está vacío!', 'info');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 50px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.4s ease-out;
        max-width: 400px;
    `;
    
    modal.innerHTML = `
        <div style="font-size: 80px; color: #8B9A7E; margin-bottom: 20px;">✓</div>
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #2C2C2C; margin-bottom: 15px;">¡Muchas gracias por tu compra!</h2>
        <p style="font-size: 16px; color: #6B6272;">Nos pondremos en contacto contigo pronto</p>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    if (!document.querySelector('#modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
    actualizarBadgeCarrito();
    
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => overlay.remove(), 300);
    }, 3000);
}

window.addEventListener('scroll', function() {
    const menu = document.querySelector('.menu');
    if (window.scrollY > 100) {
        menu.classList.add('sticky');
    } else {
        menu.classList.remove('sticky');
    }
});

console.log('📦 Sistema de Carrito para productos cargado');