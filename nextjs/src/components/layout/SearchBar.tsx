"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send } from "lucide-react";
import { BsStars } from "react-icons/bs";
import useDebounce from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

export interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  short?: string;
  end?: string;
  link?: string;
  onClick?: () => void;
}

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onActionSelect?: (action: Action) => void;
  actions?: Action[];
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = "Search or ask anything... (Press / to search)",
  value,
  onChange,
  onActionSelect,
  actions = [],
  className = "",
  inputRef: externalInputRef,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;

  const [isFocused, setIsFocused] = useState(false);
  const [result, setResult] = useState<{ actions: Action[] } | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const debouncedQuery = useDebounce(value, 200);

  // Handle search results
  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      setResult({ actions });
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = actions.filter((action) => {
      const searchableText = action.label.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    setResult({ actions: filteredActions });
  }, [debouncedQuery, isFocused, actions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    onChange("");
    setIsFocused(false);

    if (onActionSelect) {
      onActionSelect(action);
    } else {
      // Default behavior if no handler provided
      if (action.link) {
        router.push(action.link);
      }

      if (action.onClick) {
        action.onClick();
      }
    }
  };

  const handleFocus = () => {
    setSelectedAction(null);
    setIsFocused(true);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, inputRef]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`w-full rounded-full overflow-hidden transition-all duration-200 ease-in-out ${
          isFocused
            ? "bg-gradient-to-r from-purple-200 to-blue-200 shadow-md"
            : "bg-gradient-to-r from-purple-50 to-blue-50 shadow-md"
        }`}
      >
        <div className="flex items-center p-2">
          <div
            className={`p-1 ${
              isFocused ? "text-purple-600" : "text-gray-400"
            } transition-colors duration-200`}
          >
            <BsStars size={16} />
          </div>
          <input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className={`flex-grow h-8 outline-none bg-transparent border-none focus:ring-0 text-sm ${
              isFocused
                ? "font-semibold text-gray-800 placeholder-gray-700"
                : "text-gray-600 placeholder-gray-400"
            } transition-colors duration-200`}
          />
          <div className="h-5 w-5 pr-2">
            <AnimatePresence mode="wait">
              {value.length > 0 ? (
                <motion.div
                  key="send"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4 text-purple-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search results dropdown */}
      <AnimatePresence>
        {isFocused &&
          result &&
          !selectedAction &&
          result.actions.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 mt-2 border rounded-lg shadow-lg overflow-hidden bg-white z-50"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul>
                {result.actions.map((action) => (
                  <motion.li
                    key={action.id}
                    className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    variants={item}
                    layout
                    onClick={() => handleActionSelect(action)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{action.icon}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {action.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {action.short}
                      </span>
                      <span className="text-xs text-gray-400 text-right">
                        {action.end}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="mt-1 px-4 py-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Press ⌘K to open commands</span>
                  <span>ESC to cancel</span>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
