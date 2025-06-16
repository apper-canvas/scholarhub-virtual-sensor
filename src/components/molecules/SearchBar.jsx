import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  showFilter = false,
  onFilterClick 
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Debounced search would go here in a real app
    onSearch?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ApperIcon name="Search" size={16} className="text-surface-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-surface-300 rounded-md leading-5 bg-white placeholder-surface-500 focus:outline-none focus:placeholder-surface-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm"
        />
        {showFilter && (
          <button
            type="button"
            onClick={onFilterClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary"
          >
            <ApperIcon name="Filter" size={16} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;