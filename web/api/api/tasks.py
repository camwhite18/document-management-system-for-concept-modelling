import spacy
import torch
from celery import shared_task
from spacy import displacy

from .models import Document
from .utils import sanitise_input_text, unescape_text

# This is a workaround for a bug in spacy
torch.set_num_threads(1)

nlp = spacy.load("/home/api/ner-model")


@shared_task
def perform_tagging(document_id, project_id):
    document = Document.objects.get(id=document_id, project_id=project_id)
    if not document:
        return
    html = displacy.render(nlp(sanitise_input_text(document.text)), style="ent", minify=True)
    document.tagged_text = unescape_text(html)
    document.save()
