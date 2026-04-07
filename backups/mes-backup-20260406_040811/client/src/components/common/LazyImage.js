import React, { useState, useEffect, useRef } from 'react';

/**
 * 懒加载图片组件
 * 使用 Intersection Observer API 实现视口外图片延迟加载
 * 
 * @param {string} src - 图片地址
 * @param {string} alt - 替代文本
 * @param {string} placeholder - 占位图地址（可选）
 * @param {string} effect - 加载效果：blur | fade | none
 * @param {number} threshold - 触发阈值（0-1），默认 0.1
 * @param {string} className - 自定义样式类名
 * @param {object} style - 自定义样式对象
 */
const LazyImage = ({
  src,
  alt = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZzwvdGV4dD48L3N2Zz4=',
  effect = 'fade',
  threshold = 0.1,
  className = '',
  style = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      // 不支持 Intersection Observer，直接加载
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 提前 50px 加载
        threshold,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const imageStyle = {
    display: 'block',
    width: '100%',
    height: 'auto',
    opacity: isLoaded ? 1 : 0,
    transition: effect === 'fade' ? 'opacity 0.3s ease-in-out' : 'none',
  };

  const placeholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: isLoaded ? 0 : 1,
    transition: effect === 'blur' ? 'filter 0.3s ease' : 'opacity 0.3s ease',
    filter: effect === 'blur' && isLoaded ? 'blur(10px)' : 'none',
  };

  return (
    <div
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={containerStyle}
    >
      {/* 占位图 */}
      {(!isLoaded || !isInView) && (
        <img
          src={placeholder}
          alt=""
          style={placeholderStyle}
          aria-hidden="true"
        />
      )}

      {/* 真实图片 */}
      {isInView && (
        <img
          src={error ? placeholder : src}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
