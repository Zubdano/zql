import unittest

from .pipeline import Processor, CompositeProcessor


class PlusTwo(Processor):

    def process(self, data):
        return data + 2


class MinusOne(Processor):
 
    def process(self, data):
        return data - 1


class TestPipeline(unittest.TestCase):

    def test_run_processors(self):
        processors = [PlusTwo(), MinusOne()]
        comp_proc = CompositeProcessor(processors)
        self.assertEqual(3, comp_proc.process(2))
