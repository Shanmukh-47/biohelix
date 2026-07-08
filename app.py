import os
import re
import secrets
import logging
from flask import Flask, render_template, jsonify, request, abort
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime

# ─── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# ─── App Factory ──────────────────────────────────────────────────────────────
app = Flask(__name__, template_folder='templates', static_folder='static')

# Secret key for session security (auto-generated each deploy, safe)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024  # 64 KB max request size (blocks large uploads)
app.config['JSON_SORT_KEYS'] = False

# ─── Rate Limiter (Anti-abuse / Anti-DDoS) ────────────────────────────────────
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "60 per hour"],
    storage_uri="memory://"
)

# ─── Security Headers ─────────────────────────────────────────────────────────
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

# ─── Codon Mapping Table ──────────────────────────────────────────────────────
CODON_TABLE = {
    "UUU": {"symbol": "Phe", "name": "Phenylalanine",       "color": "#ff7675"},
    "UUC": {"symbol": "Phe", "name": "Phenylalanine",       "color": "#ff7675"},
    "UUA": {"symbol": "Leu", "name": "Leucine",             "color": "#74b9ff"},
    "UUG": {"symbol": "Leu", "name": "Leucine",             "color": "#74b9ff"},
    "UCU": {"symbol": "Ser", "name": "Serine",              "color": "#55efc4"},
    "UCC": {"symbol": "Ser", "name": "Serine",              "color": "#55efc4"},
    "UCA": {"symbol": "Ser", "name": "Serine",              "color": "#55efc4"},
    "UCG": {"symbol": "Ser", "name": "Serine",              "color": "#55efc4"},
    "UAU": {"symbol": "Tyr", "name": "Tyrosine",            "color": "#a29bfe"},
    "UAC": {"symbol": "Tyr", "name": "Tyrosine",            "color": "#a29bfe"},
    "UAA": {"symbol": "STOP","name": "Stop Codon",          "color": "#d63031"},
    "UAG": {"symbol": "STOP","name": "Stop Codon",          "color": "#d63031"},
    "UGU": {"symbol": "Cys", "name": "Cysteine",            "color": "#ffeaa7"},
    "UGC": {"symbol": "Cys", "name": "Cysteine",            "color": "#ffeaa7"},
    "UGA": {"symbol": "STOP","name": "Stop Codon",          "color": "#d63031"},
    "UGG": {"symbol": "Trp", "name": "Tryptophan",          "color": "#fd79a8"},
    "CUU": {"symbol": "Leu", "name": "Leucine",             "color": "#74b9ff"},
    "CUC": {"symbol": "Leu", "name": "Leucine",             "color": "#74b9ff"},
    "CUA": {"symbol": "Leu", "name": "Leucine",             "color": "#74b9ff"},
    "CUG": {"symbol": "Leu", "name": "Leucine",             "color": "#74b9ff"},
    "CCU": {"symbol": "Pro", "name": "Proline",             "color": "#eccc68"},
    "CCC": {"symbol": "Pro", "name": "Proline",             "color": "#eccc68"},
    "CCA": {"symbol": "Pro", "name": "Proline",             "color": "#eccc68"},
    "CCG": {"symbol": "Pro", "name": "Proline",             "color": "#eccc68"},
    "CAU": {"symbol": "His", "name": "Histidine",           "color": "#ff6b81"},
    "CAC": {"symbol": "His", "name": "Histidine",           "color": "#ff6b81"},
    "CAA": {"symbol": "Gln", "name": "Glutamine",           "color": "#70a1ff"},
    "CAG": {"symbol": "Gln", "name": "Glutamine",           "color": "#70a1ff"},
    "CGU": {"symbol": "Arg", "name": "Arginine",            "color": "#2ed573"},
    "CGC": {"symbol": "Arg", "name": "Arginine",            "color": "#2ed573"},
    "CGA": {"symbol": "Arg", "name": "Arginine",            "color": "#2ed573"},
    "CGG": {"symbol": "Arg", "name": "Arginine",            "color": "#2ed573"},
    "AUU": {"symbol": "Ile", "name": "Isoleucine",          "color": "#ffa502"},
    "AUC": {"symbol": "Ile", "name": "Isoleucine",          "color": "#ffa502"},
    "AUA": {"symbol": "Ile", "name": "Isoleucine",          "color": "#ffa502"},
    "AUG": {"symbol": "Met", "name": "Methionine (Start)",  "color": "#1dd1a1"},
    "ACU": {"symbol": "Thr", "name": "Threonine",           "color": "#ffbe76"},
    "ACC": {"symbol": "Thr", "name": "Threonine",           "color": "#ffbe76"},
    "ACA": {"symbol": "Thr", "name": "Threonine",           "color": "#ffbe76"},
    "ACG": {"symbol": "Thr", "name": "Threonine",           "color": "#ffbe76"},
    "AAU": {"symbol": "Asn", "name": "Asparagine",          "color": "#f8c291"},
    "AAC": {"symbol": "Asn", "name": "Asparagine",          "color": "#f8c291"},
    "AAA": {"symbol": "Lys", "name": "Lysine",              "color": "#9b59b6"},
    "AAG": {"symbol": "Lys", "name": "Lysine",              "color": "#9b59b6"},
    "AGU": {"symbol": "Ser", "name": "Serine",              "color": "#55efc4"},
    "AGC": {"symbol": "Ser", "name": "Serine",              "color": "#55efc4"},
    "AGA": {"symbol": "STOP","name": "Stop Codon",          "color": "#d63031"},
    "AGG": {"symbol": "Arg", "name": "Arginine",            "color": "#2ed573"},
    "GUU": {"symbol": "Val", "name": "Valine",              "color": "#10ac84"},
    "GUC": {"symbol": "Val", "name": "Valine",              "color": "#10ac84"},
    "GUA": {"symbol": "Val", "name": "Valine",              "color": "#10ac84"},
    "GUG": {"symbol": "Val", "name": "Valine",              "color": "#10ac84"},
    "GCU": {"symbol": "Ala", "name": "Alanine",             "color": "#1abc9c"},
    "GCC": {"symbol": "Ala", "name": "Alanine",             "color": "#1abc9c"},
    "GCA": {"symbol": "Ala", "name": "Alanine",             "color": "#1abc9c"},
    "GCG": {"symbol": "Ala", "name": "Alanine",             "color": "#1abc9c"},
    "GAU": {"symbol": "Asp", "name": "Aspartic Acid",       "color": "#e74c3c"},
    "GAC": {"symbol": "Asp", "name": "Aspartic Acid",       "color": "#e74c3c"},
    "GAA": {"symbol": "Glu", "name": "Glutamic Acid",       "color": "#c0392b"},
    "GAG": {"symbol": "Glu", "name": "Glutamic Acid",       "color": "#c0392b"},
    "GGU": {"symbol": "Gly", "name": "Glycine",             "color": "#f1c40f"},
    "GGC": {"symbol": "Gly", "name": "Glycine",             "color": "#f1c40f"},
    "GGA": {"symbol": "Gly", "name": "Glycine",             "color": "#f1c40f"},
    "GGG": {"symbol": "Gly", "name": "Glycine",             "color": "#f1c40f"},
}

STOP_CODONS = {"UAA", "UAG", "AGA", "UGA"}

MAX_SEQUENCE_LENGTH = 5000  # Prevent abuse with huge sequences

# ─── Biological Gene Presets ─────────────────────────────────────────────────
PRESETS = {
    "insulin": {
        "name": "Human Insulin",
        "desc": "Metabolism & Blood Glucose Regulation",
        "sequence": "ATGGCCTGTGGATGCGCCTCCTGCCCCTGCTGCGGCGGCCTCCTCTAA"
    },
    "hemoglobin": {
        "name": "Hemoglobin Beta",
        "desc": "Gas Carrier Oxygen Transport",
        "sequence": "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGTTGTAG"
    },
    "collagen": {
        "name": "Collagen Alpha-1",
        "desc": "Structural Matrix for Bone & Skin",
        "sequence": "ATGGCTTTTGTGGGTGACAAAGGCCCCTCTGGAGAGCCCGGTTCTCCTGGCGAGCCCGGTGAAGCTGGTCCTGTTGGTCCTGCTGGACAAAGATAG"
    },
    "keratin": {
        "name": "Keratin-1",
        "desc": "Hair & Skin Barrier Shield",
        "sequence": "ATGTCCTCCTCTGTTAAGTCTTCCTCTGGCTCTTCCGTTACTCGTTCTTCCAACTCTTCCCGTGGCTCTTGTAGCCTTGGTGGAGGCTCTAGATAG"
    }
}

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/presets')
@limiter.limit("30 per minute")
def get_presets():
    return jsonify(PRESETS)

@app.route('/api/translate', methods=['POST'])
@limiter.limit("30 per minute")
def translate_dna():
    # Block requests missing JSON content type
    if not request.is_json:
        abort(415)

    data = request.get_json(silent=True) or {}
    raw_sequence = data.get('sequence', '')

    # Type check – must be a string
    if not isinstance(raw_sequence, str):
        return jsonify({"success": False, "error": "Sequence must be a text string."}), 400

    sequence = raw_sequence.strip().upper()

    # Empty check
    if not sequence:
        return jsonify({"success": False, "error": "DNA sequence cannot be empty."}), 400

    # Length check (prevent server overload / abuse)
    if len(sequence) > MAX_SEQUENCE_LENGTH:
        return jsonify({
            "success": False,
            "error": f"Sequence too long. Maximum allowed is {MAX_SEQUENCE_LENGTH} bases."
        }), 400

    # Strict character whitelist (only A, T, C, G)
    if not re.fullmatch(r'[ATCG]+', sequence):
        invalid = sorted(set(c for c in sequence if c not in 'ATCG'))
        return jsonify({
            "success": False,
            "error": f"Invalid characters detected: {', '.join(invalid)}. Only A, T, C, G are allowed."
        }), 400

    logger.info(f"Translation request: {len(sequence)} bases from {request.remote_addr}")

    # ── 1. Transcription: DNA → mRNA ──────────────────────────────────────────
    mrna_sequence = sequence.replace('T', 'U')

    # ── 2. Scan for AUG Start Codon ───────────────────────────────────────────
    start_index = mrna_sequence.find("AUG")

    steps = []
    amino_acids = []
    translation_status = "idle"

    # Full mRNA codon list (from position 0)
    codons_list = [mrna_sequence[i:i+3] for i in range(0, len(mrna_sequence), 3) if len(mrna_sequence[i:i+3]) == 3]

    if start_index == -1:
        translation_status = "error"
        steps.append({
            "phase": "Initiation Failure",
            "message": "Ribosome scanned mRNA but no AUG start codon was found. Translation aborted.",
            "type": "error"
        })
    else:
        translation_status = "active"

        if start_index > 0:
            steps.append({
                "phase": "5' UTR Scan",
                "message": f"Ribosome scanned {start_index} upstream nucleotides without initiating.",
                "type": "info"
            })

        steps.append({
            "phase": "Initiation",
            "message": f"Start codon AUG detected at index {start_index}. Methionine (Met) added to chain.",
            "type": "start",
            "index": start_index
        })

        current_idx = start_index
        while current_idx < len(mrna_sequence):
            codon = mrna_sequence[current_idx:current_idx + 3]

            if len(codon) < 3:
                steps.append({
                    "phase": "Elongation Interrupted",
                    "message": f"Incomplete codon '{codon}' at mRNA tail. Translation halted.",
                    "type": "warning",
                    "index": current_idx
                })
                break

            if codon in STOP_CODONS:
                steps.append({
                    "phase": "Termination",
                    "message": f"Stop codon '{codon}' at position {current_idx}. Polypeptide chain released.",
                    "type": "stop",
                    "codon": codon,
                    "index": current_idx
                })
                translation_status = "completed"
                break

            amino_acid_info = CODON_TABLE.get(codon)
            if amino_acid_info:
                amino_acids.append({
                    "codon": codon,
                    "symbol": amino_acid_info["symbol"],
                    "name": amino_acid_info["name"],
                    "color": amino_acid_info["color"],
                    "index": current_idx
                })
                steps.append({
                    "phase": "Elongation",
                    "message": f"Codon '{codon}' → tRNA anticodon → {amino_acid_info['name']} ({amino_acid_info['symbol']}) added.",
                    "type": "elongation",
                    "codon": codon,
                    "amino_acid": amino_acid_info["symbol"],
                    "color": amino_acid_info["color"],
                    "index": current_idx
                })
            else:
                steps.append({
                    "phase": "Translation Error",
                    "message": f"Codon '{codon}' could not be decoded.",
                    "type": "error",
                    "index": current_idx
                })

            current_idx += 3

        if translation_status == "active":
            translation_status = "incomplete"
            steps.append({
                "phase": "Termination Fault",
                "message": "End of mRNA reached without a stop codon. Chain released incompletely.",
                "type": "warning"
            })

    return jsonify({
        "success": True,
        "dna": sequence,
        "mrna": mrna_sequence,
        "codons": codons_list,
        "start_index": start_index,
        "status": translation_status,
        "amino_acids": amino_acids,
        "steps": steps
    })

# ─── Global Error Handlers ───────────────────────────────────────────────────
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"success": False, "error": "Bad request."}), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Resource not found."}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"success": False, "error": "Method not allowed."}), 405

@app.errorhandler(413)
def too_large(e):
    return jsonify({"success": False, "error": "Request too large."}), 413

@app.errorhandler(415)
def unsupported_media(e):
    return jsonify({"success": False, "error": "Content-Type must be application/json."}), 415

@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({"success": False, "error": "Too many requests. Please slow down."}), 429

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Internal server error: {e}")
    return jsonify({"success": False, "error": "Internal server error. Please try again."}), 500

# ─── Production Entry Point ───────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
