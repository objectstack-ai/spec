// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { TranslationData } from '@objectstack/spec/system';

/**
 * Español (es-ES) — CRM App Translations
 *
 * Per-locale file: one file per language, following the `per_locale` convention.
 */
export const esES: TranslationData = {
  objects: {
    account: {
      label: 'Cuenta',
      pluralLabel: 'Cuentas',
      fields: {
        account_number: { label: 'Número de Cuenta' },
        name: { label: 'Nombre de Cuenta', help: 'Nombre legal de la empresa u organización' },
        type: {
          label: 'Tipo',
          options: { prospect: 'Prospecto', customer: 'Cliente', partner: 'Socio', former: 'Anterior' },
        },
        industry: {
          label: 'Industria',
          options: {
            technology: 'Tecnología', finance: 'Finanzas', healthcare: 'Salud',
            retail: 'Comercio', manufacturing: 'Manufactura', education: 'Educación',
          },
        },
        annual_revenue: { label: 'Ingresos Anuales' },
        number_of_employees: { label: 'Número de Empleados' },
        phone: { label: 'Teléfono' },
        website: { label: 'Sitio Web' },
        billing_address: { label: 'Dirección de Facturación' },
        office_location: { label: 'Ubicación de Oficina' },
        owner: { label: 'Propietario de Cuenta' },
        parent_account: { label: 'Cuenta Matriz' },
        description: { label: 'Descripción' },
        is_active: { label: 'Activo' },
        last_activity_date: { label: 'Fecha de Última Actividad' },
      },
    },

    contact: {
      label: 'Contacto',
      pluralLabel: 'Contactos',
      fields: {
        salutation: { label: 'Título' },
        first_name: { label: 'Nombre' },
        last_name: { label: 'Apellido' },
        full_name: { label: 'Nombre Completo' },
        account: { label: 'Cuenta' },
        email: { label: 'Correo Electrónico' },
        phone: { label: 'Teléfono' },
        mobile: { label: 'Móvil' },
        title: { label: 'Cargo' },
        department: {
          label: 'Departamento',
          options: {
            Executive: 'Ejecutivo', Sales: 'Ventas', Marketing: 'Marketing',
            Engineering: 'Ingeniería', Support: 'Soporte', Finance: 'Finanzas',
            HR: 'Recursos Humanos', Operations: 'Operaciones',
          },
        },
        owner: { label: 'Propietario de Contacto' },
        description: { label: 'Descripción' },
        is_primary: { label: 'Contacto Principal' },
      },
    },

    lead: {
      label: 'Prospecto',
      pluralLabel: 'Prospectos',
      fields: {
        first_name: { label: 'Nombre' },
        last_name: { label: 'Apellido' },
        company: { label: 'Empresa' },
        title: { label: 'Cargo' },
        email: { label: 'Correo Electrónico' },
        phone: { label: 'Teléfono' },
        status: {
          label: 'Estado',
          options: {
            new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado',
            unqualified: 'No Calificado', converted: 'Convertido',
          },
        },
        lead_source: {
          label: 'Origen del Prospecto',
          options: {
            Web: 'Web', Referral: 'Referencia', Event: 'Evento',
            Partner: 'Socio', Advertisement: 'Publicidad', 'Cold Call': 'Llamada en Frío',
          },
        },
        owner: { label: 'Propietario' },
        is_converted: { label: 'Convertido' },
        description: { label: 'Descripción' },
      },
    },

    opportunity: {
      label: 'Oportunidad',
      pluralLabel: 'Oportunidades',
      fields: {
        name: { label: 'Nombre de Oportunidad' },
        account: { label: 'Cuenta' },
        primary_contact: { label: 'Contacto Principal' },
        owner: { label: 'Propietario de Oportunidad' },
        amount: { label: 'Monto' },
        expected_revenue: { label: 'Ingreso Esperado' },
        stage: {
          label: 'Etapa',
          options: {
            prospecting: 'Prospección', qualification: 'Calificación',
            needs_analysis: 'Análisis de Necesidades', proposal: 'Propuesta',
            negotiation: 'Negociación', closed_won: 'Cerrada Ganada', closed_lost: 'Cerrada Perdida',
          },
        },
        probability: { label: 'Probabilidad (%)' },
        close_date: { label: 'Fecha de Cierre' },
        type: {
          label: 'Tipo',
          options: {
            'New Business': 'Nuevo Negocio',
            'Existing Customer - Upgrade': 'Cliente Existente - Mejora',
            'Existing Customer - Renewal': 'Cliente Existente - Renovación',
            'Existing Customer - Expansion': 'Cliente Existente - Expansión',
          },
        },
        forecast_category: {
          label: 'Categoría de Pronóstico',
          options: {
            Pipeline: 'Pipeline', 'Best Case': 'Mejor Caso',
            Commit: 'Compromiso', Omitted: 'Omitida', Closed: 'Cerrada',
          },
        },
        description: { label: 'Descripción' },
        next_step: { label: 'Próximo Paso' },
      },
    },
  },

  apps: {
    crm_enterprise: {
      label: 'CRM Empresarial',
      description: 'Gestión de relaciones con clientes para ventas, servicio y marketing',
    },
  },

  messages: {
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.back': 'Volver',
    'common.confirm': 'Confirmar',
    'nav.sales': 'Ventas',
    'nav.service': 'Servicio',
    'nav.marketing': 'Marketing',
    'nav.products': 'Productos',
    'nav.analytics': 'Analítica',
    'success.saved': 'Registro guardado exitosamente',
    'success.converted': 'Prospecto convertido exitosamente',
    'confirm.delete': '¿Está seguro de que desea eliminar este registro?',
    'confirm.convert_lead': '¿Convertir este prospecto en cuenta, contacto y oportunidad?',
    'error.required': 'Este campo es obligatorio',
    'error.load_failed': 'Error al cargar los datos',
  },

  validationMessages: {
    amount_required_for_closed: 'El monto es obligatorio cuando la etapa es Cerrada Ganada',
    close_date_required: 'La fecha de cierre es obligatoria para las oportunidades',
    discount_limit: 'El descuento no puede superar el 40%',
  },
};
