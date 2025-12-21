
export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Hotel Management</h2>
        <p className="mb-8 max-w-lg mx-auto text-sm">
          La mejor experiencia de lujo y confort. Tu descanso es nuestra prioridad.
        </p>
        <div className="border-t border-gray-800 pt-8 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Hotel Management. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};