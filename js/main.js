document.addEventListener("DOMContentLoaded", () => {
  // Selección de elementos del DOM con querySelector
  const operacionesBody = document.querySelector("#operaciones-body");
  const operacionFormId = document.querySelector("#operacion-form-id");

  // Elementos del formulario
  const operacionformIdInput = document.querySelector("#operation-id");
  const descripcionInput = document.querySelector("#descripcion");
  const operacionModal = document.querySelector("#operacion-Modal");
  const tipoInput = document.querySelector("#tipo");
  const categoriaSelect = document.querySelector("#categoria");
  const fechaInput = document.querySelector("#fecha");
  const montoInput = document.querySelector("#monto");
  const deleteModal = document.querySelector("#delete-modal");
  const modalTitle = document.querySelector("#modal-title");
  const confirmDeleteBoton = document.querySelector("#confirm-delete-boton");

  // Elementos del balance
  const gananciasBalan = document.querySelector("#ganancias");
  const gastosBalan = document.querySelector("#gastos");
  const totalBalan = document.querySelector("#total");

  // Estado
  let operations = [];
  let operationToDeleteId = null;

  // Mostrar u ocultar modal de operación
  const toggleOperationModal = (open = false) => {
    const modalInstance = bootstrap.Modal.getInstance(operacionModal);
    if (open) {
      modalInstance.show();
    } else {
      modalInstance.hide();
      operacionFormId.reset();
      operacionformIdInput.value = ""; // Limpiar el campo ID
    }
  };

  // Mostrar u ocultar modal de eliminación
  const toggleDeleteModal = (open = false) => {
    let modalInstance = bootstrap.Modal.getInstance(deleteModal);
    if (!modalInstance) {
      modalInstance = new bootstrap.Modal(deleteModal);
    }
    if (open) {
      modalInstance.show();
    } else {
      modalInstance.hide();
      operationToDeleteId = null;
    }
  };

  // Renderizar las operaciones en la tabla
  const renderOperations = () => {
    console.log("renderOperations");
    operacionesBody.innerHTML = "";

    operations.forEach((operation) => {
      const row = document.createElement("div");
      /*row.className = "row align-items-center py-2 border-bottom";*/
      row.className = "row ";
      row.innerHTML = `
                    <div class="col fw-bold">${operation.descripcion}</div>
                    <div class="col">
                        <span class="badge bg-light text-dark">${
                          operation.categoria
                        }</span>
                    </div>
                    <div class="col text-secondary">${operation.fecha}</div>
                    <div class="col fw-bold ${
                      operation.tipo === "Ganancias"
                        ? "text-success"
                        : "text-danger"
                    }">
                        ${
                          operation.tipo === "Ganancias" ? "+" : "-"
                        } $${Math.abs(operation.monto).toFixed(2)}
                    </div>
                    <div class="col text-end">
                        <a href="#" class="edit-btn text-primary me-3" data-id="${
                          operation.id
                        }">Editar</a>
                        <a href="#" class="delete-btn text-danger" data-id="${
                          operation.id
                        }">Eliminar</a>
                    </div>
                    `;
      operacionesBody.appendChild(row);
    });

    updateBalance();
  };

  // Calcular y actualizar balance

  const updateBalance = () => {
    let ganancias = 0;
    let gastos = 0;

    operations.forEach((op) => {
      console.log("operacion", op);
      if (op.tipo === "Ganancias") {
        ganancias += op.monto;
      } else {
        gastos += Math.abs(op.monto);
      }
    });

    const total = ganancias - gastos;

    console.log("updateBalance", ganancias, gastos, total);

    gananciasBalan.textContent = `+ $${ganancias.toFixed(2)}`;
    gastosBalan.textContent = `- $${gastos.toFixed(2)}`;
    totalBalan.textContent = `${total >= 0 ? "+" : ""} $${total.toFixed(2)}`;

    // Cambiar color del total
    if (total > 0) {
      totalBalan.classList.remove("text-red-600");
      totalBalan.classList.add("text-green-600");
    } else if (total < 0) {
      totalBalan.classList.remove("text-green-600");
      totalBalan.classList.add("text-red-600");
    } else {
      totalBalan.classList.remove("text-green-600", "text-red-600");
    }
  };

  // Enviar formulario
  operacionFormId.addEventListener(
    "submit",
    function (e) {
      console.log("Formulario enviado");
      e.preventDefault();

      const id = operacionFormId.value || Date.now().toString();
      const descripcion = descripcionInput.value;
      const tipo = tipoInput.value;
      const categoria = categoriaSelect.value;
      const fecha = fechaInput.value;
      const monto = parseFloat(montoInput.value);

      const newOperation = { id, descripcion, tipo, categoria, fecha, monto };

      const existingIndex = operations.findIndex((op) => op.id === id);

      if (existingIndex !== -1) {
        operations[existingIndex] = newOperation; // Editar
      } else {
        operations.push(newOperation); // Crear nueva
      }

      renderOperations();
      toggleOperationModal(false);

      Toastify({
        text: "Agregaste una operación",
        className: "info",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
      }).showToast();
    },
    true
  );

  // Editar o eliminar
  operacionesBody.addEventListener("click", function (e) {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains("edit-btn")) {
      e.preventDefault();
      const op = operations.find((op) => op.id === id);
      if (op) {
        modalTitle.textContent = "Editar Operación";
        operacionFormId.value = op.id;
        descripcionInput.value = op.descripcion;
        tipoInput.value = op.tipo;
        categoriaSelect.value = op.categoria;
        fechaInput.value = op.fecha;
        montoInput.value = op.monto;
        toggleOperationModal(true);
      }
    } else if (target.classList.contains("delete-btn")) {
      console.log("Eliminar operación");
      e.preventDefault();
      operationToDeleteId = id;
      toggleDeleteModal(true);
    }
  });

  // Confirmar eliminación
  confirmDeleteBoton.addEventListener("click", () => {
    if (operationToDeleteId) {
      operations = operations.filter((op) => op.id !== operationToDeleteId);
      renderOperations();
      toggleDeleteModal(false);

      Toastify({
        text: "Operación eliminada",
        className: "info",
        style: {
          background: "linear-gradient(to right, #ff416c, #ff4b2b)",
        },
      }).showToast();
    }
  });

  // Cargar datos iniciales (vacío)
  renderOperations();
});
