// ============================================
// CARRITO DE COMPRAS - CRUD COMPLETO
// ============================================

// Variable global del carrito
let carrito = [];

// Esperar a que cargue todo el HTML
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página cargada');
    
    // Pequeño delay para asegurar que todo el DOM esté listo
    setTimeout(() => {
        iniciarApp();
        crearBadgeCarrito(); // Crear contador de productos
        ocultarProductos(); // Ocultar productos al inicio
        configurarFiltros(); // Configurar filtros de categorías
    }, 100);
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
// OCULTAR PRODUCTOS AL INICIO
// ============================================
function ocultarProductos() {
    const seccionProductos = document.querySelector('#lista-1');
    if (seccionProductos) {
        seccionProductos.style.display = 'none';
        console.log('✅ Productos ocultos al inicio');
    } else {
        console.error('❌ No se encontró la sección #lista-1');
    }
}

// ============================================
// FILTROS POR CATEGORÍA
// ============================================
function configurarFiltros() {
    const botonesCategorias = document.querySelectorAll('.btn-categoria');
    console.log('🔍 Botones de categoría encontrados:', botonesCategorias.length);
    
    if (botonesCategorias.length === 0) {
        console.error('❌ No se encontraron botones con clase .btn-categoria');
    }
    
    botonesCategorias.forEach(boton => {
        boton.addEventListener('click', function(e) {
            // Si es un enlace <a>, prevenir comportamiento por defecto
            if (this.tagName === 'A') {
                e.preventDefault();
            }
            
            const categoria = this.getAttribute('data-categoria');
            console.log('👆 Click en categoría:', categoria);
            mostrarProductosPorCategoria(categoria);
            
            // Scroll suave a productos con un pequeño delay para asegurar que se muestre
            setTimeout(() => {
                const seccionProductos = document.querySelector('#lista-1');
                if (seccionProductos) {
                    console.log('📜 Haciendo scroll a productos');
                    seccionProductos.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    console.error('❌ No se encontró #lista-1 para hacer scroll');
                }
            }, 100);
        });
    });
}

function mostrarProductosPorCategoria(categoria) {
    console.log('🎯 Filtrando productos por:', categoria);
    
    const seccionProductos = document.querySelector('#lista-1');
    const todosLosProductos = document.querySelectorAll('.product');
    
    console.log('📦 Total de productos encontrados:', todosLosProductos.length);
    
    // Mostrar la sección de productos
    if (seccionProductos) {
        seccionProductos.style.display = 'block';
        console.log('✅ Sección de productos mostrada');
    } else {
        console.error('❌ No se encontró la sección #lista-1');
        return;
    }
    
    let productosVisibles = 0;
    
    // Filtrar productos por categoría
    todosLosProductos.forEach(producto => {
        const categoriaProducto = producto.getAttribute('data-categoria');
        
        if (categoria === 'todos' || categoriaProducto === categoria) {
            producto.style.display = 'block';
            productosVisibles++;
        } else {
            producto.style.display = 'none';
        }
    });
    
    console.log('✅ Productos visibles:', productosVisibles);
    
    // Actualizar título de productos
    const tituloProductos = document.querySelector('#lista-1 h2');
    if (tituloProductos) {
        switch(categoria) {
            case 'canastos':
                tituloProductos.textContent = 'Canastos';
                break;
            case 'arreglos':
                tituloProductos.textContent = 'Arreglos';
                break;
            case 'carteras':
                tituloProductos.textContent = 'Carteras';
                break;
            default:
                tituloProductos.textContent = 'Productos';
        }
        console.log('✅ Título actualizado a:', tituloProductos.textContent);
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
            <td><a href="#" class="borrar-producto" data-id="${producto.id}" style="color:#C4A4A8; font-weight:bold; text-decoration:none; font-size:18px;">✕</a></td>
        `;
        tbody.appendChild(row);
    });
    
    // Agregar fila del total
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
        // Extraer el número del precio (ej: "$15.000" -> 15000)
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
console.log('✅ Filtros por categoría activados');