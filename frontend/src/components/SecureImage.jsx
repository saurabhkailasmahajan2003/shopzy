import { useEffect, useRef } from 'react';

const SecureImage = ({ 
  src, 
  alt = 'Profile image', 
  className = '', 
  fallback = null,
  size = 'w-24 h-24',
  showWatermark = true 
}) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    
    if (!img || !container) return;

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable drag
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable copy (Ctrl+C, Cmd+C)
    const handleCopy = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable save image (Ctrl+S, Cmd+S)
    const handleSave = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    // Disable print screen (F12, Print Screen)
    const handleKeyDown = (e) => {
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+Shift+I (Developer Tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+Shift+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    img.addEventListener('contextmenu', handleContextMenu);
    img.addEventListener('dragstart', handleDragStart);
    img.addEventListener('selectstart', handleSelectStart);
    img.addEventListener('copy', handleCopy);
    container.addEventListener('keydown', handleSave);
    container.addEventListener('keydown', handleKeyDown);

    // Set draggable to false
    img.setAttribute('draggable', 'false');
    
    // Add CSS to prevent selection
    img.style.userSelect = 'none';
    img.style.webkitUserSelect = 'none';
    img.style.mozUserSelect = 'none';
    img.style.msUserSelect = 'none';
    img.style.pointerEvents = 'auto';

    // Cleanup
    return () => {
      img.removeEventListener('contextmenu', handleContextMenu);
      img.removeEventListener('dragstart', handleDragStart);
      img.removeEventListener('selectstart', handleSelectStart);
      img.removeEventListener('copy', handleCopy);
      container.removeEventListener('keydown', handleSave);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle image load error
  const handleError = () => {
    if (imgRef.current) {
      imgRef.current.style.display = 'none';
    }
  };

  if (!src && fallback) {
    return (
      <div 
        ref={containerRef}
        className={`${size} ${className} rounded-full bg-[#8B4513] text-[#FAF8F5] flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg select-none`}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {fallback}
      </div>
    );
  }

  if (!src) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`${size} ${className} relative rounded-full overflow-hidden border-4 border-white shadow-lg select-none`}
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        MsUserSelect: 'none',
        pointerEvents: 'auto'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          MsUserSelect: 'none',
          WebkitUserDrag: 'none',
          KhtmlUserDrag: 'none',
          MozUserDrag: 'none',
          OUserDrag: 'none',
          userDrag: 'none',
          pointerEvents: 'none',
          imageRendering: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%'
        }}
        draggable="false"
        onError={handleError}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        loading="lazy"
      />
      {showWatermark && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)',
            mixBlendMode: 'overlay'
          }}
        />
      )}
      {/* Additional protection overlay */}
      <div 
        className="absolute inset-0 pointer-events-auto"
        style={{
          cursor: 'default',
          userSelect: 'none'
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
};

export default SecureImage;

