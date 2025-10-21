// Carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
    crearBadgeCarrito();
    mostrarCarrito();
    inicializarMenuYCarrito();
});

function iniciarApp() {

    // Botones "Agregar al carrito"
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    console.log('Botones encontrados:', botonesAgregar.length);
    
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            agregarAlCarrito(e);
        });
    });
    
    // Boton "Vaciar al carrito"
    const btnVaciar = document.querySelector('#vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', function(e) {
            e.preventDefault();
            vaciarCarrito();
        });
    }


    // Botones "FInalizar compra"
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
        const submenu = imgCarrito.closest('.submenu');
        if (submenu) {
            submenu.style.position = 'relative';
            submenu.appendChild(badge);
        }
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
    if (menu && window.scrollY > 100) {
        menu.classList.add('sticky');
    } else if (menu) {
        menu.classList.remove('sticky');
    }
});


function inicializarMenuYCarrito() {
    const menuCheckbox = document.getElementById('menu');
    const navbar = document.querySelector('.navbar');
    
    if (menuCheckbox && navbar) {
        const menuLinks = navbar.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 991) {
                    menuCheckbox.checked = false;
                }
            });
        });
    }
    
    const carritoIcon = document.querySelector('#img-carrito');
    const carritoDiv = document.querySelector('#carrito');
    
    if (!carritoIcon || !carritoDiv) {
        console.error('No se encontró el carrito o el ícono');
        return;
    }
    
    let carritoAbierto = false;
    
    function isMobile() {
        return window.innerWidth <= 991;
    }



    // NOTA: Utilizo estilos inline en esta función debido a conflictos
// de especificidad CSS con el hover del carrito en desktop. Los estilos inline
// son con la unica manera en la que mi carrito aparecia en la funcion mobile sino lo hacia
// de esta manera mi carrito aparecia fuera de la pantalla o directamente no aparecia.
    function abrirCarrito() {
        carritoDiv.style.cssText = `
            display: block !important;
            position: fixed !important;
            top: 90px !important;
            left: 50% !important;
            transform: translateX(-50%) scale(0.9) !important;
            width: 90% !important;
            max-width: 450px !important;
            min-height: 250px !important;
            max-height: 75vh !important;
            overflow-y: auto !important;
            padding: 20px !important;
            z-index: 99999 !important;
            background: white !important;
            border-radius: 10px !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
            opacity: 0 !important;
            transition: all 0.3s ease-out !important;
        `;
        
        carritoDiv.offsetHeight;
        
        carritoDiv.style.opacity = '1';
        carritoDiv.style.transform = 'translateX(-50%) scale(1)';
        
        carritoAbierto = true;
    }
    
    function cerrarCarrito() {
        carritoDiv.style.opacity = '0';
        carritoDiv.style.transform = 'translateX(-50%) scale(0.9)';
        
        setTimeout(() => {
            carritoDiv.style.display = 'none';
        }, 300);
        
        carritoAbierto = false;
    }
    
    carritoIcon.addEventListener('click', function(e) {
        if (isMobile()) {
            e.preventDefault();
            e.stopPropagation();
            
            if (carritoAbierto) {
                cerrarCarrito();
            } else {
                abrirCarrito();
            }
        }
    });
    
    document.addEventListener('click', function(e) {
        if (isMobile() && carritoAbierto) {
            if (!carritoDiv.contains(e.target) && 
                !carritoIcon.contains(e.target) &&
                !e.target.closest('.submenu')) {
                cerrarCarrito();
            }
        }
    });
    
    carritoDiv.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (!isMobile()) {
                carritoDiv.style.display = '';
                carritoAbierto = false;
            } else {
                if (!carritoAbierto) {
                    carritoDiv.style.display = 'none';
                }
            }
        }, 250);
    });
    
    if (isMobile()) {
        carritoDiv.style.display = 'none';
        carritoAbierto = false;
    }
}