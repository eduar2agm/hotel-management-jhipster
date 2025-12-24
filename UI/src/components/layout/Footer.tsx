
export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-6 text-center">
        <div className="border-t border-gray-800 pt-8 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} © Hotel - Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};