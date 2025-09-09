// Este servicio simula el envío de trazas de ejecución a un webhook
// Usamos un servicio de prueba como https://webhook.site/ para obtener una URL temporal

// 🔁 REEMPLAZA ESTA URL CON LA QUE OBTENGAS DE webhook.site
const WEBHOOK_URL = 'https://webhook.site/c2c6ff7d-cc34-4bf7-b108-544f2bae00e5';

export interface TraceEvent {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  data?: any;
}

export const webhookService = {
  //Envía un evento al webhook
  sendTrace: async (event: TraceEvent): Promise<void> => {
    try {
      //En producción, aquí se enviaría realmente con fetch/axios
      console.log('Webhook Trace:', event);

      // Simulamos el envío real con un timeout y console.log
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Para una implementación real (descomenta estas líneas):
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      
    } catch (error) {
      console.error('Error sending to webhook:', error);
    }
  },

  // Función helper para crear eventos de traza
  createEvent: (level: TraceEvent['level'], component: string, message: string, data?: any): TraceEvent => ({
    timestamp: new Date().toISOString(),
    level,
    component,
    message,
    data
  })
};