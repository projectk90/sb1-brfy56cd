import React, { useState, useEffect } from 'react';
import { Lock, Film, Clapperboard, LogOut, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Types for our data
interface Film {
  id: string;
  title: string;
  description: string;
  release_year: number;
  poster_url: string;
  backdrop_url: string;
  iframe_url: string;
  genre: string[];
}

interface Series {
  id: string;
  title: string;
  description: string;
  seasons: number;
  poster_url: string;
  backdrop_url: string;
  iframe_url: string;
  genre: string[];
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [films, setFilms] = useState<Film[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [activeTab, setActiveTab] = useState<'films' | 'series'>('films');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('cineFamAuth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async () => {
    if (accessCode === 'OwnedByCineFam') {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: 'admin@cinefam.com',
        password: accessCode
      });

      if (error) {
        setErrorMessage('Authentication failed. Please try again.');
        return;
      }

      setIsAuthenticated(true);
      setErrorMessage('');
      localStorage.setItem('cineFamAuth', 'true');
      fetchData();
    } else {
      setErrorMessage('Invalid access code. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    localStorage.removeItem('cineFamAuth');
  };

  const fetchData = async () => {
    try {
      const [filmsData, seriesData] = await Promise.all([
        supabase.from('films').select('*'),
        supabase.from('series').select('*')
      ]);

      if (filmsData.data) setFilms(filmsData.data);
      if (seriesData.data) setSeries(seriesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to load data. Please try again.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const promises = [];
      
      // Update films
      for (const film of films) {
        promises.push(
          supabase
            .from('films')
            .upsert({ ...film })
        );
      }
      
      // Update series
      for (const show of series) {
        promises.push(
          supabase
            .from('series')
            .upsert({ ...show })
        );
      }
      
      await Promise.all(promises);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving data:', error);
      setErrorMessage('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewFilm = () => {
    const newFilm: Film = {
      id: crypto.randomUUID(),
      title: 'New Film',
      description: '',
      release_year: new Date().getFullYear(),
      poster_url: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg',
      backdrop_url: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg',
      iframe_url: '',
      genre: []
    };
    setFilms([...films, newFilm]);
  };

  const addNewSeries = () => {
    const newSeries: Series = {
      id: crypto.randomUUID(),
      title: 'New Series',
      description: '',
      seasons: 1,
      poster_url: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg',
      backdrop_url: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
      iframe_url: '',
      genre: []
    };
    setSeries([...series, newSeries]);
  };

  const deleteFilm = (id: string) => {
    setFilms(films.filter(film => film.id !== id));
  };

  const deleteSeries = (id: string) => {
    setSeries(series.filter(series => series.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">CineFam Admin Portal</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-1">
                Access Code
              </label>
              <input
                id="accessCode"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your access code"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Access Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">CineFam Admin Portal</h1>
          <button
            onClick={handleLogout}
            className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('films')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'films'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Film className="h-5 w-5 mr-2" />
                Films
              </button>
              <button
                onClick={() => setActiveTab('series')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'series'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clapperboard className="h-5 w-5 mr-2" />
                Series
              </button>
            </nav>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'films' ? 'Edit Films' : 'Edit Series'}
              </h2>
              <button
                onClick={activeTab === 'films' ? addNewFilm : addNewSeries}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New {activeTab === 'films' ? 'Film' : 'Series'}
              </button>
            </div>
            {activeTab === 'films' ? (
              <FilmsEditor films={films} updateFilm={(film) => {
                setFilms(films.map(f => f.id === film.id ? film : f));
              }} deleteFilm={deleteFilm} />
            ) : (
              <SeriesEditor series={series} updateSeries={(series) => {
                setSeries(prev => prev.map(s => s.id === series.id ? series : s));
              }} deleteSeries={deleteSeries} />
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center px-6 py-3 rounded-md text-white font-medium ${
              isSaving ? 'bg-gray-400' : saveSuccess ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors`}
          >
            {isSaving ? (
              'Saving...'
            ) : saveSuccess ? (
              <>
                <Save className="h-5 w-5 mr-2" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

interface FilmsEditorProps {
  films: Film[];
  updateFilm: (film: Film) => void;
  deleteFilm: (id: string) => void;
}

function FilmsEditor({ films, updateFilm, deleteFilm }: FilmsEditorProps) {
  return (
    <div className="space-y-8">
      {films.map((film) => (
        <div key={film.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => deleteFilm(film.id)}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5 mr-1" />
              Delete
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
                <input
                  type="text"
                  value={film.poster_url}
                  onChange={(e) => updateFilm({ ...film, poster_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <img
                  src={film.poster_url}
                  alt={film.title}
                  className="w-full h-auto rounded-lg object-cover aspect-[2/3] shadow-md mt-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backdrop URL</label>
                <input
                  type="text"
                  value={film.backdrop_url}
                  onChange={(e) => updateFilm({ ...film, backdrop_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <img
                  src={film.backdrop_url}
                  alt={`${film.title} backdrop`}
                  className="w-full h-auto rounded-lg object-cover aspect-video shadow-md mt-2"
                />
              </div>
            </div>
            <div className="md:w-3/4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={film.title}
                  onChange={(e) => updateFilm({ ...film, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={film.description}
                  onChange={(e) => updateFilm({ ...film, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                  <input
                    type="number"
                    value={film.release_year}
                    onChange={(e) => updateFilm({ ...film, release_year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={film.genre.join(', ')}
                    onChange={(e) => updateFilm({ ...film, genre: e.target.value.split(',').map(g => g.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Iframe URL (for trailers/videos)</label>
                <input
                  type="text"
                  value={film.iframe_url}
                  onChange={(e) => updateFilm({ ...film, iframe_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {film.iframe_url && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={film.iframe_url}
                      className="w-full h-full"
                      allowFullScreen
                      title={`${film.title} trailer`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SeriesEditorProps {
  series: Series[];
  updateSeries: (series: Series) => void;
  deleteSeries: (id: string) => void;
}

function SeriesEditor({ series, updateSeries, deleteSeries }: SeriesEditorProps) {
  return (
    <div className="space-y-8">
      {series.map((show) => (
        <div key={show.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => deleteSeries(show.id)}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5 mr-1" />
              Delete
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
                <input
                  type="text"
                  value={show.poster_url}
                  onChange={(e) => updateSeries({ ...show, poster_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <img
                  src={show.poster_url}
                  alt={show.title}
                  className="w-full h-auto rounded-lg object-cover aspect-[2/3] shadow-md mt-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backdrop URL</label>
                <input
                  type="text"
                  value={show.backdrop_url}
                  onChange={(e) => updateSeries({ ...show, backdrop_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <img
                  src={show.backdrop_url}
                  alt={`${show.title} backdrop`}
                  className="w-full h-auto rounded-lg object-cover aspect-video shadow-md mt-2"
                />
              </div>
            </div>
            <div className="md:w-3/4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={show.title}
                  onChange={(e) => updateSeries({ ...show, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={show.description}
                  onChange={(e) => updateSeries({ ...show, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seasons</label>
                  <input
                    type="number"
                    value={show.seasons}
                    onChange={(e) => updateSeries({ ...show, seasons: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={show.genre.join(', ')}
                    onChange={(e) => updateSeries({ ...show, genre: e.target.value.split(',').map(g => g.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Iframe URL (for trailers/videos)</label>
                <input
                  type="text"
                  value={show.iframe_url}
                  onChange={(e) => updateSeries({ ...show, iframe_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {show.iframe_url && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={show.iframe_url}
                      className="w-full h-full"
                      allowFullScreen
                      title={`${show.title} trailer`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;