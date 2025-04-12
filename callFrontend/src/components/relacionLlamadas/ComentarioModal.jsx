import { Button } from '@mui/material';
import '../../styles/LoginScreen.css';

export const ComentarioModal = ({ onClose, modalOpen }) => {
    if (!modalOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal fade show" style={{ display: "block" }} aria-labelledby="exampleModalLabel" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document" style={{ maxWidth: "40vw", marginTop: 90 }}>
                    <div className="modal-content w-100" style={{ maxWidth: "60vw" }}>
                        <div className="modal-header" style={{ backgroundColor: '#1b2631' }}>
                            <h5 className="modal-title" style={{ color: 'white' }}>Agregar Comentario</h5>
                        </div>
                        <form>
                            <div className="modal-body">

                                {/* Contenedor scrollable para comentarios */}
                                <div className="mb-3">
                                    <label className="form-label">Comentarios anteriores</label>
                                    <div
                                        style={{
                                            maxHeight: "400px",
                                            overflowY: "auto",
                                            border: "1px solid #ccc",
                                            borderRadius: "5px",
                                            padding: "10px",
                                            backgroundColor: "#f8f9fa"
                                        }}
                                    >
                                        <div style={{ marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
                                        </div>

                                        <p className="text-muted">No hay comentarios previos.</p>

                                    </div>
                                </div>

                                {/* Textarea para nuevo comentario */}
                                <div className="mb-3">
                                    <label className="form-label">Añadir comentario</label>
                                    <textarea id="nota" name="nota" className="form-control"></textarea>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <Button type="submit" style={{ backgroundColor: "#1b2631", color: "white" }}>
                                    Guardar
                                </Button>

                                <Button type="button" style={{ backgroundColor: "#641e16", color: "white", marginLeft: 7 }} onClick={onClose}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
