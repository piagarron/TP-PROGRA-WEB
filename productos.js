// ============================================
// CARRITO DE COMPRAS - PÁGINAS DE PRODUCTOS
// ============================================

// Variable global del carrito
let carrito = [];

// Esperar a que cargue todo el HTML
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página de productos cargada');
    iniciarApp();
    crearBadgeCarrito();
});

function iniciarApp() {
    // Obtener todos los botones "Agregar al carrito"
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    console.log('Botones encontrados:', botonesAgregar.length);
    
    // Agregar evento click a cada botón
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            agregarAlCarrito(e);
        });
    });
    
    // Botón vaciar carrito
    const btnVaciar = document.querySelector('#vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', function(e) {
            e.preventDefault();
            vaciarCarrito();
        });
    }
    
    // Evento para eliminar productos del carrito
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

// ============================================
// CREAR BADGE/CONTADOR EN EL CARRITO
// ============================================
function crearBadgeCarrito() {
    const imgCarrito = document.querySelector('#img-carrito');
    
    if (!imgCarrito) return;
    
    let badge = document.querySelector('#carrito-badge');
    
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'carrito-badge';
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #B88B93;
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            display: none;
        `;
        
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

// ============================================
// MOSTRAR NOTIFICACIÓN
// ============================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    
    const colores = {
        success: '#E8D5D8',
        error: '#C4A4A8',
        info: '#DCD5E0'
    };
    
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo]};
        color: #2C2C2C;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        min-width: 250px;
    `;
    
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    if (!document.querySelector('#notificacion-styles')) {
        const style = document.createElement('style');
        style.id = 'notificacion-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// ============================================
// CREATE - AGREGAR PRODUCTO
// ============================================
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
        mostrarNotificacion('¡Producto agregado al carrito con éxito!', 'success');
    } else {
        carrito.push(infoProducto);
        mostrarNotificacion('¡Producto agregado al carrito con éxito!', 'success');
    }
    
    mostrarCarrito();
    actualizarBadgeCarrito();
}

// ============================================
// READ - MOSTRAR CARRITO
// ============================================
function mostrarCarrito() {
    const tbody = document.querySelector('#lista-carrito tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (carrito.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">Carrito vacío</td></tr>';
        return;
    }
    
    carrito.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${producto.imagen}" width="80"></td>
            <td>${producto.titulo}</td>
            <td>${producto.precio}</td>
            <td>${producto.cantidad}</td>
            <td><a href="#" class="borrar-producto" data-id="${producto.id}" style="color:#C4A4A8; font-weight:bold; text-decoration:none; font-size:18px;">✕</a></td>
        `;
        tbody.appendChild(row);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.style.backgroundColor = '#F5E8E8';
    totalRow.style.fontWeight = 'bold';
    
    const total = calcularTotal();
    
    totalRow.innerHTML = `
        <td colspan="2" style="text-align:right; padding:15px;">TOTAL:</td>
        <td colspan="2" style="color:#2C2C2C; font-size:18px; padding:15px;">$${total.toLocaleString('es-AR')}</td>
    `;
    tbody.appendChild(totalRow);
}

// ============================================
// UPDATE - CALCULAR TOTAL
// ============================================
function calcularTotal() {
    let total = 0;
    
    carrito.forEach(producto => {
        const precioLimpio = producto.precio.replace(/\$|\.|\s/g, '');
        const precio = parseFloat(precioLimpio);
        total += precio * producto.cantidad;
    });
    
    return total;
}

// ============================================
// DELETE - ELIMINAR PRODUCTO
// ============================================
function eliminarProducto(e) {
    const id = e.target.getAttribute('data-id');
    const productoEliminado = carrito.find(prod => prod.id === id);
    
    carrito = carrito.filter(producto => producto.id !== id);
    
    if (productoEliminado) {
        mostrarNotificacion('¡Producto eliminado del carrito!', 'error');
    }
    
    mostrarCarrito();
    actualizarBadgeCarrito();
}

// ============================================
// DELETE - VACIAR CARRITO
// ============================================
function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('¡El carrito ya está vacío!', 'info');
        return;
    }
    
    carrito = [];
    mostrarCarrito();
    actualizarBadgeCarrito();
    mostrarNotificacion('¡Carrito vaciado con éxito!', 'success');
}

// ============================================
// FUNCIONES ÚTILES
// ============================================
function obtenerCantidadTotal() {
    return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

console.log('📦 Sistema de Carrito para productos cargado');

// ============================================
// MENÚ STICKY AL HACER SCROLL
// ============================================
window.addEventListener('scroll', function() {
    const menu = document.querySelector('.menu');
    if (window.scrollY > 100) {
        menu.classList.add('sticky');
    } else {
        menu.classList.remove('sticky');
    }
});