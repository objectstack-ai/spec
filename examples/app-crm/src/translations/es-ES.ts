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
      _views: {
        all_accounts: { label: 'Todas las Cuentas', description: 'Lista maestra de cuentas con ingresos e industria' },
        account_gallery: { label: 'Galería de Cuentas', description: 'Vista de tarjetas con colores de marca' },
        account_map: { label: 'Mapa de Cuentas', description: 'Distribución geográfica de cuentas' },
        enterprise_accounts: { label: 'Cuentas Empresariales', description: 'Cuentas con mayores ingresos anuales' },
        my_accounts: { label: 'Mis Cuentas', description: 'Cuentas asignadas al usuario actual' },
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
      _views: {
        all_contacts: { label: 'Todos los Contactos' },
        contact_directory: { label: 'Directorio de Contactos' },
        primary_contacts: { label: 'Contactos Principales' },
      },
      _actions: {
        mark_primary: {
          label: 'Marcar como Principal',
          confirmText: '¿Establecer este contacto como contacto principal de la cuenta?',
          successMessage: '¡Establecido como contacto principal!',
        },
        send_email: {
          label: 'Enviar Correo',
        },
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
      _views: {
        all_leads: { label: 'Todos los Prospectos' },
        kanban_by_status: { label: 'Pipeline de Prospectos' },
        calendar_by_created: { label: 'Calendario de Prospectos' },
        gallery_view: { label: 'Galería de Prospectos' },
        my_leads: { label: 'Mis Prospectos' },
        high_priority: { label: 'Alta Prioridad' },
      },
      _actions: {
        convert_lead: {
          label: 'Convertir Prospecto',
          confirmText: '¿Está seguro de querer convertir este prospecto?',
          successMessage: '¡Prospecto convertido con éxito!',
        },
        create_campaign: {
          label: 'Agregar a Campaña',
          successMessage: '¡Prospecto agregado a la campaña!',
        },
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
      _views: {
        all_opportunities: { label: 'Todas las Oportunidades' },
        pipeline_kanban: { label: 'Pipeline de Ventas' },
        close_date_calendar: { label: 'Calendario de Pronóstico' },
        deal_timeline: { label: 'Línea de Tiempo' },
        deal_gallery: { label: 'Galería de Negocios' },
        my_open_deals: { label: 'Mis Negocios Abiertos' },
      },
      _actions: {
        clone_opportunity: {
          label: 'Clonar Oportunidad',
          successMessage: '¡Oportunidad clonada con éxito!',
        },
        mass_update_stage: {
          label: 'Actualizar Etapa',
          successMessage: '¡Etapa de oportunidad actualizada!',
        },
      },
    },

    case: {
      label: 'Caso',
      pluralLabel: 'Casos',
      _views: {
        all_cases: { label: 'Todos los Casos' },
        case_workflow: { label: 'Flujo de Servicio' },
        sla_calendar: { label: 'Calendario SLA' },
        case_timeline: { label: 'Línea de Tiempo de Casos' },
        escalated_cases: { label: 'Casos Escalados' },
      },
      _actions: {
        escalate_case: {
          label: 'Escalar Caso',
          confirmText: 'Esto enviará el caso al equipo de escalación. ¿Continuar?',
          successMessage: '¡Caso escalado con éxito!',
        },
        close_case: {
          label: 'Cerrar Caso',
          confirmText: '¿Está seguro de querer cerrar este caso?',
          successMessage: '¡Caso cerrado con éxito!',
        },
      },
    },

    contract: {
      label: 'Contrato',
      pluralLabel: 'Contratos',
      _views: {
        all_contracts: { label: 'Todos los Contratos' },
        renewal_calendar: { label: 'Calendario de Renovación' },
        contract_gantt: { label: 'Plazos del Contrato' },
        contract_timeline: { label: 'Línea de Tiempo' },
      },
    },

    product: {
      label: 'Producto',
      pluralLabel: 'Productos',
      _views: {
        all_products: { label: 'Todos los Productos' },
        product_catalog: { label: 'Catálogo de Productos' },
        low_stock: { label: 'Stock Bajo' },
      },
    },

    quote: {
      label: 'Cotización',
      pluralLabel: 'Cotizaciones',
      _views: {
        all_quotes: { label: 'Todas las Cotizaciones' },
        quote_pipeline: { label: 'Pipeline de Cotizaciones' },
        quote_calendar: { label: 'Calendario de Cotizaciones' },
      },
    },

    task: {
      label: 'Tarea',
      pluralLabel: 'Tareas',
      _views: {
        all_tasks: { label: 'Todas las Tareas' },
        task_board: { label: 'Tablero de Tareas' },
        task_calendar: { label: 'Calendario de Tareas' },
        task_gantt: { label: 'Plan de Ejecución' },
        task_timeline: { label: 'Línea de Tiempo' },
        my_open_tasks: { label: 'Mis Tareas Abiertas' },
      },
    },

    campaign: {
      label: 'Campaña',
      pluralLabel: 'Campañas',
      _views: {
        all_campaigns: { label: 'Todas las Campañas' },
        campaign_gantt: { label: 'Programación de Campañas' },
        campaign_calendar: { label: 'Calendario de Campañas' },
        campaign_timeline: { label: 'Línea de Tiempo de Marketing' },
      },
    },
  },

  globalActions: {
    log_call: {
      label: 'Registrar Llamada',
      successMessage: '¡Llamada registrada con éxito!',
    },
    export_csv: {
      label: 'Exportar CSV',
      successMessage: '¡Exportación completada!',
    },
  },

  apps: {
    crm_enterprise: {
      label: 'CRM Empresarial',
      description: 'Gestión de relaciones con clientes para ventas, servicio y marketing',
      navigation: {
        group_sales: { label: 'Ventas' },
        group_service: { label: 'Servicio' },
        group_marketing: { label: 'Marketing' },
        group_products: { label: 'Productos' },
        group_analytics: { label: 'Analíticas' },
      },
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

  dashboards: {
    crm_overview_dashboard: {
      label: 'Resumen CRM',
      description: 'Métricas de ingresos, analítica de pipeline e información de oportunidades',
      actions: {
        create_opportunity: { label: 'Nueva oportunidad' },
        create_lead: { label: 'Nuevo prospecto' },
        '/reports': { label: 'Informes' },
      },
      widgets: {
        total_revenue: { title: 'Ingresos totales', description: 'Ingresos cerrados ganados en este período' },
        active_deals: { title: 'Negocios activos', description: 'Oportunidades abiertas en el pipeline' },
        win_rate: { title: 'Tasa de éxito', description: 'Proporción de negocios cerrados ganados sobre los resueltos en este período' },
        avg_deal_size: { title: 'Tamaño medio del negocio', description: 'Valor medio de los negocios cerrados ganados' },
        revenue_trends: { title: 'Tendencia de ingresos', description: 'Ingresos cerrados ganados de los últimos 12 meses' },
        lead_source: { title: 'Origen del prospecto', description: 'Valor del pipeline por canal de adquisición' },
        pipeline_by_stage: { title: 'Pipeline por etapa', description: 'Valor de oportunidades abiertas en cada etapa de venta' },
        top_products: { title: 'Productos principales', description: 'Ingresos a precio de lista por categoría de producto' },
        recent_opportunities: { title: 'Oportunidades recientes', description: 'Negocios actualizados más recientemente por el equipo' },
      },
    },
    executive_dashboard: {
      label: 'Vista ejecutiva',
      description: 'KPI de alto nivel sobre ingresos, clientes y pipeline para la dirección',
      actions: {
        export_dashboard_pdf: { label: 'Exportar PDF' },
        schedule_dashboard_email: { label: 'Programar correo' },
        customize_dashboard: { label: 'Personalizar' },
      },
      widgets: {
        total_revenue_ytd: { title: 'Ingresos totales (YTD)', description: 'Ingresos cerrados ganados en lo que va del año' },
        total_accounts: { title: 'Cuentas activas', description: 'Clientes con al menos una relación activa' },
        total_contacts: { title: 'Total de contactos', description: 'Personas en nuestra agenda' },
        open_leads: { title: 'Prospectos abiertos', description: 'Prospectos sin convertir en el embudo' },
        revenue_trend: { title: 'Tendencia de ingresos', description: 'Ingresos cerrados ganados de los últimos 12 meses' },
        revenue_by_industry: { title: 'Ingresos por industria', description: 'Ingresos YTD ganados separados por industria de la cuenta' },
        pipeline_by_stage: { title: 'Pipeline por etapa', description: 'Valor de oportunidades abiertas por etapa de venta' },
        new_accounts_by_month: { title: 'Cuentas nuevas', description: 'Ritmo de creación de cuentas en los últimos 6 meses' },
        top_accounts_by_revenue: { title: 'Cuentas principales por ingresos', description: 'Mayores clientes ordenados por ingreso anual' },
      },
    },
    sales_dashboard: {
      label: 'Rendimiento de ventas',
      description: 'Analítica de pipeline, tendencias de tasa de éxito y rendimiento de los representantes',
      actions: {
        create_opportunity: { label: 'Nueva oportunidad' },
        '/reports/forecast': { label: 'Previsión' },
        export_dashboard_pdf: { label: 'Exportar' },
      },
      widgets: {
        total_pipeline_value: { title: 'Pipeline total', description: 'Suma del valor de las oportunidades abiertas' },
        closed_won_qtd: { title: 'Cerrado ganado (trimestre)', description: 'Ingresos cerrados este trimestre' },
        open_opportunities: { title: 'Oportunidades abiertas', description: 'Negocios activos en curso' },
        avg_deal_size: { title: 'Tamaño medio del negocio', description: 'Valor medio de los negocios cerrados ganados este trimestre' },
        pipeline_by_stage: { title: 'Pipeline por etapa', description: 'Valor de oportunidades abiertas en cada etapa de venta' },
        monthly_revenue_trend: { title: 'Tendencia mensual de ingresos', description: 'Ingresos cerrados ganados de los últimos 12 meses' },
        opportunities_by_owner: { title: 'Oportunidades por responsable', description: 'Valor del pipeline abierto por representante' },
        lead_source_breakdown: { title: 'Origen del prospecto', description: 'De dónde proviene nuestro pipeline' },
        top_opportunities: { title: 'Oportunidades abiertas principales', description: 'Negocios de mayor valor aún en curso' },
      },
    },
    service_dashboard: {
      label: 'Servicio al cliente',
      description: 'Carga de casos, salud del SLA y rendimiento de resolución',
      actions: {
        create_case: { label: 'Nuevo caso' },
        '/objects/case?owner=current_user': { label: 'Mi cola' },
        '/reports/sla': { label: 'Informe de SLA' },
      },
      widgets: {
        open_cases: { title: 'Casos abiertos', description: 'Casos que aún no se han cerrado' },
        critical_cases: { title: 'Casos críticos', description: 'Casos abiertos marcados como prioridad crítica' },
        avg_resolution_time: { title: 'Tiempo medio de resolución', description: 'Tiempo medio hasta el cierre, en horas' },
        sla_violations: { title: 'Incumplimientos de SLA', description: 'Casos que incumplieron su SLA' },
        cases_by_status: { title: 'Casos por estado', description: 'Distribución de la carga a lo largo del pipeline' },
        cases_by_priority: { title: 'Casos por prioridad', description: 'Mezcla de casos abiertos por urgencia' },
        cases_by_origin: { title: 'Casos por origen', description: 'De dónde provienen nuestros casos' },
        daily_case_volume: { title: 'Volumen diario de casos', description: 'Casos nuevos creados en los últimos 30 días' },
        sla_compliance_gauge: { title: 'Cumplimiento de SLA', description: 'Porcentaje de casos resueltos dentro del SLA en este período' },
        my_open_cases: { title: 'Mis casos abiertos', description: 'Casos asignados a ti, ordenados por prioridad' },
      },
    },
  },
};
