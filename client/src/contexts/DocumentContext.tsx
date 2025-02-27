import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useMemo, 
  ReactNode,
  useCallback
} from 'react';
import { DocumentContext as DocumentContextType, ActionType } from '../types/document';

// Default state for the document context
const defaultDocumentContext: DocumentContextType = {
  selectedText: '',
  currentParagraph: '',
  fullContent: '',
  fullDocument: '',
  documentTitle: 'Untitled Document',
  totalWords: 0,
  lastEdit: new Date().toISOString(),
  hasSaved: false,
  currentFormat: {
    isBold: false,
    isItalic: false,
    isUnderline: false,
    font: 'Arial'
  }
};


// Create a context for our document data
const DocumentContextContext = createContext<{
  documentContext: DocumentContextType;
  updateContext: (action: ActionType) => void;
}>({
  documentContext: defaultDocumentContext,
  updateContext: () => {},
});

// Reducer function to handle context updates
function documentContextReducer(
  state: DocumentContextType,
  action: ActionType
): DocumentContextType {
  switch (action.type) {
    case 'SELECTION_CHANGE':
      return { ...state, ...action.payload };
    case 'CONTENT_CHANGE':
      return { ...state, ...action.payload };
    case 'TITLE_CHANGE':
      return { ...state, ...action.payload };
    case 'SAVE_STATE_CHANGE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Provider component that wraps parts of our app that need the document context
export const DocumentContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [documentContext, dispatch] = useReducer(
    documentContextReducer,
    defaultDocumentContext
  );

  // Memoize the context value to prevent unnecessary re-renders
  const updateContext = useCallback((action: ActionType) => {
    dispatch(action);
  }, []);

  const contextValue = useMemo(() => ({
    documentContext,
    updateContext,
  }), [documentContext, updateContext]);

  return (
    <DocumentContextContext.Provider value={contextValue}>
      {children}
    </DocumentContextContext.Provider>
  );
};

// Hook to use the document context
export const useDocumentContext = () => {
  const context = useContext(DocumentContextContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentContextProvider');
  }
  return context;
};

// Specialized hook for AI-specific document context usage
export const useAIDocumentContext = () => {
  const { documentContext } = useContext(DocumentContextContext);
  
  // Return only the properties needed for AI context, including currentFormat
  return useMemo(() => ({
    selectedText: documentContext.selectedText,
    currentParagraph: documentContext.currentParagraph,
    fullContent: documentContext.fullContent,
    fullDocument: documentContext.fullDocument,
    documentTitle: documentContext.documentTitle,
    totalWords: documentContext.totalWords,
    lastEdit: documentContext.lastEdit,
    currentFormat: documentContext.currentFormat
  }), [
    documentContext.selectedText,
    documentContext.currentParagraph,
    documentContext.fullContent,
    documentContext.fullDocument,
    documentContext.documentTitle,
    documentContext.totalWords,
    documentContext.lastEdit,
    documentContext.currentFormat
  ]);
};