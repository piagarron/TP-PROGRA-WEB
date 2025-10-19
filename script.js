// ============================================
// CARRITO DE COMPRAS - CRUD COMPLETO
// ============================================

// Variable global del carrito
let carrito = [];

// Esperar a que cargue todo el HTML
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página cargada');
    iniciarApp();
    crearBadgeCarrito(); // Crear contador de productos
});

function iniciarApp() {
    // Obtener todos los botones "Agregar al carrito"
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    console.log('Botones encontrados:', botonesAgregar.length);
    
    // Agregar evento click a cada botón
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Click en agregar');
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
    
    // Verificar si ya existe el badge
    let badge = document.querySelector('#carrito-badge');
    
    if (!badge) {
        // Crear el badge
        badge = document.createElement('span');
        badge.id = 'carrito-badge';
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4757;
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
        
        // Hacer que el contenedor del carrito sea relative
        const submenu = imgCarrito.parentElement;
        submenu.style.position = 'relative';
        
        // Agregar el badge
        submenu.appendChild(badge);
    }
    
    actualizarBadgeCarrito();
}

// ============================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ============================================
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
    // Crear contenedor de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    
    // Estilos según el tipo
    const colores = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo]};
        color: white;
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
    
    // Agregar al body
    document.body.appendChild(notificacion);
    
    // Agregar animación CSS
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
    
    // Eliminar después de 3 segundos
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
    console.log('Agregando producto...');
    
    // Obtener el elemento padre que contiene toda la info del producto
    const producto = e.target.parentElement.parentElement;
    
    // Leer información del producto
    const infoProducto = {
        imagen: producto.querySelector('img').src,
        titulo: producto.querySelector('h3').textContent,
        precio: producto.querySelector('.precio').textContent,
        id: e.target.getAttribute('data-id'),
        cantidad: 1
    };
    
    console.log('Producto:', infoProducto);
    
    // Verificar si ya existe en el carrito
    const existe = carrito.find(prod => prod.id === infoProducto.id);
    
    if (existe) {
        // Si existe, aumentar cantidad
        carrito = carrito.map(prod => {
            if (prod.id === infoProducto.id) {
                prod.cantidad++;
            }
            return prod;
        });
        
        // Notificación de cantidad actualizada
        mostrarNotificacion('¡Producto agregado al carrito con éxito!', 'success');
    } else {
        // Si no existe, agregar al carrito
        carrito.push(infoProducto);
        
        // Notificación de producto agregado
        mostrarNotificacion('¡Producto agregado al carrito con éxito!', 'success');
    }
    
    console.log('Carrito actual:', carrito);
    
    // Mostrar en el HTML
    mostrarCarrito();
    
    // Actualizar contador del carrito
    actualizarBadgeCarrito();
}

// ============================================
// READ - MOSTRAR CARRITO
// ============================================
function mostrarCarrito() {
    console.log('Mostrando carrito...');
    
    const tbody = document.querySelector('#lista-carrito tbody');
    
    if (!tbody) {
        console.error('No se encontró el tbody del carrito');
        return;
    }
    
    // Limpiar carrito anterior
    tbody.innerHTML = '';
    
    // Si el carrito está vacío
    if (carrito.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">Carrito vacío</td></tr>';
        return;
    }
    
    // Mostrar cada producto
    carrito.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${producto.imagen}" width="80"></td>
            <td>${producto.titulo}</td>
            <td>${producto.precio} x ${producto.cantidad}</td>
            <td><a href="#" class="borrar-producto" data-id="${producto.id}" style="color:red; font-weight:bold; text-decoration:none; font-size:18px;">✕</a></td>
        `;
        tbody.appendChild(row);
    });
    
    // Agregar fila del total
    const totalRow = document.createElement('tr');
    totalRow.style.backgroundColor = '#f0f0f0';
    totalRow.style.fontWeight = 'bold';
    
    const total = calcularTotal();
    
    totalRow.innerHTML = `
        <td colspan="2" style="text-align:right; padding:15px;">TOTAL:</td>
        <td colspan="2" style="color:#d97d54; font-size:18px; padding:15px;">$${total.toFixed(2)}</td>
    `;
    tbody.appendChild(totalRow);
}

// ============================================
// UPDATE - CALCULAR TOTAL
// ============================================
function calcularTotal() {
    let total = 0;
    
    carrito.forEach(producto => {
        // Extraer el número del precio (ej: "$200" -> 200)
        const precio = parseFloat(producto.precio.replace('$', '').replace(',', ''));
        total += precio * producto.cantidad;
    });
    
    return total;
}

// ============================================
// DELETE - ELIMINAR PRODUCTO
// ============================================
function eliminarProducto(e) {
    console.log('Eliminando producto...');
    
    const id = e.target.getAttribute('data-id');
    
    // Obtener nombre del producto antes de eliminarlo
    const productoEliminado = carrito.find(prod => prod.id === id);
    
    // Filtrar el producto eliminado
    carrito = carrito.filter(producto => producto.id !== id);
    
    console.log('Carrito después de eliminar:', carrito);
    
    // Notificación de producto eliminado
    if (productoEliminado) {
        mostrarNotificacion('¡Producto eliminado del carrito!', 'error');
    }
    
    // Actualizar vista
    mostrarCarrito();
    
    // Actualizar contador del carrito
    actualizarBadgeCarrito();
}

// ============================================
// DELETE - VACIAR CARRITO
// ============================================
function vaciarCarrito() {
    console.log('Vaciando carrito...');
    
    if (carrito.length === 0) {
        mostrarNotificacion('¡El carrito ya está vacío!', 'info');
        return;
    }
    
    carrito = [];
    
    mostrarCarrito();
    
    // Actualizar contador del carrito
    actualizarBadgeCarrito();
    
    // Notificación de carrito vaciado
    mostrarNotificacion('¡Carrito vaciado con éxito!', 'success');
}

// ============================================
// FUNCIONES ÚTILES ADICIONALES
// ============================================

// Obtener cantidad total de productos
function obtenerCantidadTotal() {
    return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

// Buscar un producto específico
function buscarProducto(id) {
    return carrito.find(producto => producto.id === id);
}

// Verificar si hay productos
function tieneProductos() {
    return carrito.length > 0;
}

console.log('📦 Sistema de Carrito CRUD cargado correctamente');
console.log('Operaciones disponibles:');
console.log('✅ CREATE: agregarAlCarrito()');
console.log('✅ READ: mostrarCarrito()');
console.log('✅ UPDATE: calcularTotal()');
console.log('✅ DELETE: eliminarProducto(), vaciarCarrito()');